import asyncio
import logging
import os
import re
from pathlib import Path
import subprocess

plugin_dir = Path(os.path.dirname(os.path.realpath(__file__)))
config_dir = (Path(plugin_dir) / "../../settings/decky-cloud-save").resolve()

rclone_bin = plugin_dir / "rclone"
rclone_cfg = config_dir / "rclone.conf"

cfg_syncpath_includes_file = config_dir / "sync_paths.txt"
cfg_syncpath_excludes_file = config_dir / "sync_paths_excludes.txt"
cfg_syncpath_filter_file = config_dir / "sync_paths_filter.txt"
cfg_property_file = config_dir / "plugin.properties"

logger = logging.getLogger()
logger.setLevel(logging.INFO)


async def _get_url_from_rclone_process(process: asyncio.subprocess.Process):
    while True:
        line = (await process.stderr.readline()).decode()
        logger.debug("Subprocess output: %s", line)

        url_re_match = re.search(
            "(http:\/\/127\.0\.0\.1:53682\/auth\?state=.*)\\n$", line)
        if url_re_match:
            return url_re_match.group(1)


def _is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


async def _kill_previous_spawn(process: asyncio.subprocess.Process):
    if process and process.returncode is None:
        logger.warn("Killing previous Process")
        process.kill()
        await asyncio.sleep(0.1)  # Give time for OS to clear up the port


def _regenerate_filter_file():
    with open(cfg_syncpath_includes_file, 'r') as f:
        includes = f.readlines()
    with open(cfg_syncpath_excludes_file, 'r') as f:
        excludes = f.readlines()

    with open(cfg_syncpath_filter_file, 'w') as f:
        f.write("# Last line of this file MUST be '- **' (exclude the rest) as otherwise you will start backing up the entire steam deck!\n")
        f.write("# If you are editing this file manually, make sure to not use the UI file picker, as the saves done there will overwrite.\n")
        f.write("# Examples: https://rclone.org/filtering/#examples\n")
        f.write("\n")

        for exclude in excludes:
            f.write(f"- {exclude}")
        f.write("\n")
        for include in includes:
            f.write(f"+ {include}")
        f.write("\n")
        f.write("- **\n")


def _get_config(): 
    with open(cfg_property_file) as f:
        lines = f.readlines()
        lines = list(map(lambda x: x.strip().split('='), lines))
        logger.debug("config %s", lines)
        return lines

def _set_config(key: str, value: str):
    with open(cfg_property_file, "r") as f:
        lines = f.readlines()

    with open(cfg_property_file, "w") as f:
        found = False
        for line in lines:
            if line.startswith(key + '='):
                f.write(f"{key}={value}\n")
                found = True
            else:
                f.write(line)

        if not found:
            f.write(f"{key}={value}\n")

class Plugin:
    current_spawn = None
    current_sync = None

    async def spawn(self, backend_type: str):
        logger.debug("Executing: spawn(%s)", backend_type)
        logger.info("Updating rclone.conf")

        await _kill_previous_spawn(self.current_spawn)
        if _is_port_in_use(53682):
            raise Exception('RCLONE_PORT_IN_USE')

        if backend_type == "drive":
            additional_args = ["scope=drive.file"]
        else:
            additional_args = []

        self.current_spawn = await asyncio.subprocess.create_subprocess_exec(rclone_bin, *(["config", "create", "backend", backend_type] + additional_args), stderr=asyncio.subprocess.PIPE)

        url = await _get_url_from_rclone_process(self.current_spawn)
        logger.info("Login URL: %s", url)

        return url

    async def spawn_probe(self):
        logger.debug("Executing: spawn_probe()")
        if not self.current_spawn:
            return 0

        return self.current_spawn.returncode

    async def get_backend_type(self):
        logger.debug("Executing: get_backend_type()")
        with open(rclone_cfg, "r") as f:
            l = f.readlines()
            return l[1]

#

    async def sync_now(self):
        logger.debug("Executing: sync_now()")

        config = _get_config()

        if next((x[1] for x in config if x[0] == "bisync_enabled"), "false") == "true":
            sync_command = "bisync"
            logger.debug("using bisync")
        else:
            sync_command = "copy"
            logger.debug("using copy")

        destination_path = next((x[1] for x in config if x[0] == "destination_directory"), "decky-cloud-save")

        cmd = [rclone_bin, *[sync_command, "--filter-from", cfg_syncpath_filter_file, "/", f"backend:{destination_path}", "--copy-links"]]
        logger.debug("Running command: %s", subprocess.list2cmdline(cmd))

        self.current_sync = await asyncio.subprocess.create_subprocess_exec(*cmd)

    async def sync_now_probe(self):
        logger.debug("Executing: sync_now_probe()")
        if not self.current_sync:
            return 0

        return self.current_sync.returncode

#

    async def get_syncpaths(self, file: str):
        logger.debug("Executing: get_syncpaths()")

        file = cfg_syncpath_excludes_file if file == "excludes" else cfg_syncpath_includes_file

        with open(file, "r") as f:
            return f.readlines()

    async def test_syncpath(self, path: str):
        logger.debug("Executing: test_syncpath(%s)", path)

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
            logger.debug("%s %s %s", root, os_dirs, os_files)
            count += len(os_files)
            if count > 9000:
                return "9000+"
            if scan_single_dir:
                break

        return count

    async def add_syncpath(self, path: str, file: str):
        logger.debug("Executing: add_syncpath(%s, %s)", path, file)
        logger.info("Adding Path to Sync: '%s', %s", path, file)

        file = cfg_syncpath_excludes_file if file == "excludes" else cfg_syncpath_includes_file

        with open(file, "r") as f:
            lines = f.readlines()
        for line in lines:
            if line.strip("\n") == path:
                return

        lines += [f"{path}\n"]

        with open(file, "w") as f:
            for line in lines:
                f.write(line)

        _regenerate_filter_file()

    async def remove_syncpath(self, path: str, file: str):
        logger.debug("Executing: remove_syncpath(%s, %s)", path, file)
        logger.info("Removing Path from Sync: '%s', %s", path, file)

        file = cfg_syncpath_excludes_file if file == "excludes" else cfg_syncpath_includes_file

        with open(file, "r") as f:
            lines = f.readlines()
        with open(file, "w") as f:
            for line in lines:
                if line.strip("\n") != path:
                    f.write(line)

        _regenerate_filter_file()

#

    async def get_config(self):
        logger.debug("Executing: get_config()")
        return _get_config()

    async def set_config(self, key: str, value: str):
        logger.debug("Executing: set_config(%s, %s)", key, value)
        _set_config(key, value)

# Asyncio-compatible long-running code, executed in a task when the plugin is loaded

    async def _main(self):
        logger.debug("rclone exe path: %s", rclone_bin)
        logger.debug("rclone cfg path: %s", rclone_cfg)

        if not config_dir.is_dir():
            os.makedirs(config_dir, exist_ok=True)

        if not cfg_syncpath_includes_file.is_file():
            cfg_syncpath_includes_file.touch()
        if not cfg_syncpath_excludes_file.is_file():
            cfg_syncpath_excludes_file.touch()
        if not cfg_syncpath_filter_file.is_file():
            _regenerate_filter_file()
        if not cfg_property_file.is_file():
            cfg_property_file.touch()

        # Prepopulate config
        config = _get_config()

        if not any(e[0] == "destination_directory" for e in config):
            _set_config("destination_directory", "decky-cloud-save")
        if not any(e[0] == "experimental_menu" for e in config):
            _set_config("experimental_menu", "false")

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        await _kill_previous_spawn(self.current_spawn)  # Kills only if exists
