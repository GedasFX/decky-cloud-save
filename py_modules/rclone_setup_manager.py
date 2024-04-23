import asyncio
from asyncio.subprocess import Process, create_subprocess_exec
import os
from pathlib import Path
import re
import decky_plugin
import plugin_config

async def _kill_previous_spawn(process: Process):
    if process and process.returncode is None:
        decky_plugin.logger.warn("Killing previous Process")
        
        process.kill()

        await asyncio.sleep(0.1)  # Give time for OS to clear up the port

def _is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0
    
async def _get_url_from_rclone_process(process: asyncio.subprocess.Process):
    while True:
        line = (await process.stderr.readline()).decode()
        url_re_match = re.search(
            "(http:\/\/127\.0\.0\.1:53682\/auth\?state=.*)\\n$", line)
        if url_re_match:
            return url_re_match.group(1)


class RcloneSetupManager:
    current_spawn: Process | None = None

    # Backend Setup

    async def spawn(self, backend_type: str):
        decky_plugin.logger.info("Updating rclone.conf")

        await _kill_previous_spawn(self.current_spawn)
        if _is_port_in_use(53682):
            raise Exception('RCLONE_PORT_IN_USE')

        self.current_spawn = await create_subprocess_exec(decky_plugin, *(["config", "create", "backend", backend_type]), stderr=asyncio.subprocess.PIPE)

        url = await _get_url_from_rclone_process(self.current_spawn)
        decky_plugin.logger.info("Login URL: %s", url)

        return url
    
    async def probe(self):
        if not self.current_spawn:
            return 0

        return self.current_spawn.returncode

    async def get_backend_type(self):
        with open(plugin_config.rclone_cfg, "r") as f:
            l = f.readlines()
            return l[1]
        

    # Sync Paths Setup
        
    async def get_syncpaths(self, file: str):
        file = plugin_config.cfg_syncpath_excludes_file if file == "excludes" else plugin_config.cfg_syncpath_includes_file
        with open(file, "r") as f:
            return f.readlines()

    async def test_syncpath(self, path: str):
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
        decky_plugin.logger.info("Adding Path to Sync: '%s', %s", path, file)

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
        decky_plugin.logger.info("Removing Path from Sync: '%s', %s", path, file)

        file = plugin_config.cfg_syncpath_excludes_file if file == "excludes" else plugin_config.cfg_syncpath_includes_file
        with open(file, "r") as f:
            lines = f.readlines()
        with open(file, "w") as f:
            for line in lines:
                if line.strip("\n") != path:
                    f.write(line)

        plugin_config.regenerate_filter_file()


    # Lifecycle
        
    def cleanup(self):
        _kill_previous_spawn(self.current_spawn)