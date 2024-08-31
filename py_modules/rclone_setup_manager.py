import asyncio
from asyncio.subprocess import Process, create_subprocess_exec
import os
from pathlib import Path
import re
import decky_plugin
import plugin_config

async def _kill_previous_spawn(process: Process):
    """
    Kills the previous spawned process.

    Parameters:
    process (asyncio.subprocess.Process): The process to be killed.
    """
    if process and process.returncode is None:
        decky_plugin.logger.warn("Killing previous Process")
        
        process.kill()

        await asyncio.sleep(0.1)  # Give time for OS to clear up the port

def _is_port_in_use(port: int) -> bool:
    """
    Checks if a given port is in use.

    Parameters:
    port (int): The port number to check.

    Returns:
    bool: True if the port is in use, False otherwise.
    """
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0
    
async def _get_url_from_rclone_process(process: asyncio.subprocess.Process):
    """
    Extracts the URL from the stderr of the rclone process.

    Parameters:
    process (asyncio.subprocess.Process): The rclone process.

    Returns:
    str: The URL extracted from the process output.
    """
    while True:
        line = (await process.stderr.readline()).decode()
        url_re_match = re.search(
            "(http:\/\/127\.0\.0\.1:53682\/auth\?state=.*)\\n$", line)
        if url_re_match:
            return url_re_match.group(1)

class RcloneSetupManager:
    current_spawn: Process | None = None

    async def spawn(self, backend_type: str):
        """
        Spawns a new rclone process with the specified backend type.

        Parameters:
        backend_type (str): The type of backend to use.

        Returns:
        str: The URL for authentication.
        """
        decky_plugin.logger.info("Updating rclone.conf")

        await _kill_previous_spawn(self.current_spawn)
        if _is_port_in_use(53682):
            raise Exception('RCLONE_PORT_IN_USE')

        self.current_spawn = await create_subprocess_exec(plugin_config.rclone_bin, *(["config", "create", "backend", backend_type]), stderr=asyncio.subprocess.PIPE)

        url = await _get_url_from_rclone_process(self.current_spawn)
        decky_plugin.logger.info("Login URL: %s", url)

        return url
    
    async def probe(self):
        """
        Checks if the current rclone process is running.

        Returns:
        int: The return code of the rclone process.
        """
        if not self.current_spawn:
            return 0

        return self.current_spawn.returncode

    async def get_backend_type(self):
        """
        Retrieves the current backend type from the rclone configuration.

        Returns:
        str: The current backend type.
        """
        with open(plugin_config.rclone_cfg, "r") as f:
            l = f.readlines()
            return l[1]

    async def get_syncpaths(self, file: str):
        """
        Retrieves sync paths from the specified file.

        Parameters:
        file (str): The file from which to retrieve sync paths.

        Returns:
        list: A list of sync paths.
        """
        file = plugin_config.cfg_syncpath_excludes_file if file == "excludes" else plugin_config.cfg_syncpath_includes_file
        with open(file, "r") as f:
            return f.readlines()

    async def test_syncpath(self, path: str):
        """
        Tests a sync path to determine if it's a file or a directory.

        Parameters:
        path (str): The path to test.

        Returns:
        int | str: The number of files if it's a directory, '9000+' if it exceeds the limit, or 0 if it's a file.
        """
        if not path.startswith(plugin_config.get_config_item("sync_root", "/")):
            raise Exception("Selection is outside of sync root.")

        if path.endswith("/**"):
            scan_single_dir = False
            path = path[:-3]
        elif path.endswith("/*"):
            scan_single_dir = True
            path = path[:-2]
        else:
            return int(Path(path).is_file())

        count = 0
        for root, os_dirs, os_files in os.walk(path, followlinks=True):
            decky_plugin.logger.debug("%s %s %s", root, os_dirs, os_files)
            count += len(os_files)
            if count > 9000:
                return "9000+"
            if scan_single_dir:
                break

        return count

    async def add_syncpath(self, path: str, file: str):
        """
        Adds a sync path to the specified file.

        Parameters:
        path (str): The path to add.
        file (str): The file to add the path to.
        """
        decky_plugin.logger.info("Adding Path to Sync: '%s', %s", path, file)

        # Replace the beginning of path to replace the root.
        path = path.replace(plugin_config.get_config_item("sync_root", "/"), "/", 1)

        file = plugin_config.cfg_syncpath_excludes_file if file == "excludes" else plugin_config.cfg_syncpath_includes_file

        with open(file, "r") as f:
            lines = f.readlines()
        for line in lines:
            if line.strip("\n") == path:
                return
        lines += [f"{path}\n"]
        with open(file, "w") as f:
            for line in lines:
                f.write(line)

        plugin_config.regenerate_filter_file()

    async def remove_syncpath(self, path: str, file: str):
        """
        Removes a sync path from the specified file.

        Parameters:
        path (str): The path to remove.
        file (str): The file to remove the path from.
        """
        decky_plugin.logger.info("Removing Path from Sync: '%s', %s", path, file)

        file = plugin_config.cfg_syncpath_excludes_file if file == "excludes" else plugin_config.cfg_syncpath_includes_file
        with open(file, "r") as f:
            lines = f.readlines()
        with open(file, "w") as f:
            for line in lines:
                if line.strip("\n") != path:
                    f.write(line)

        plugin_config.regenerate_filter_file()

    def cleanup(self):
        """
        Cleans up the resources.
        """
        _kill_previous_spawn(self.current_spawn)
