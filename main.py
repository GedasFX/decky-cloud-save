import asyncio
import logging
import os
import re
import subprocess
from pathlib import Path

plugin_dir = Path(os.path.dirname(os.path.realpath(__file__)))
config_dir = (Path(plugin_dir) / "../../settings/decky-cloud-save").resolve()

rclone_bin = plugin_dir / "rclone"
rclone_cfg = config_dir / "rclone.conf"

cfg_syncpath_file = config_dir / "sync_paths.txt"
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


class Plugin:
    current_spawn = None

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
        subprocess.run([rclone_bin, "copy", "--include-from",
                       cfg_syncpath_file, "/", "backend:decky-cloud-save", "--copy-links"])


#

    async def get_syncpaths(self):
        logger.debug("Executing: get_syncpaths()")
        with open(cfg_syncpath_file, "r") as f:
            return f.readlines()

    async def test_syncpath(self, path: str):
        logger.debug("Executing: test_syncpath(%s)", path)
        if not path.endswith("/**"):
            return int(Path(path).is_file())

        count = 0
        for root, os_dirs, os_files in os.walk(path[:-3], followlinks=True):
            logger.debug("%s %s %s", root, os_dirs, os_files)
            count += len(os_files)
            if count > 9000:
                return "9000+"

        return count

    async def add_syncpath(self, path: str):
        logger.debug("Executing: add_syncpath(%s)", path)
        logger.info("Adding Path to Sync: '%s'", path)

        with open(cfg_syncpath_file, "r") as f:
            lines = f.readlines()
        for line in lines:
            if line.strip("\n") == path:
                return

        lines += [f"{path}\n"]

        with open(cfg_syncpath_file, "w") as f:
            for line in lines:
                f.write(line)

    async def remove_syncpath(self, path: str):
        logger.debug("Executing: remove_syncpath(%s)", path)
        logger.info("Removing Path from Sync: '%s'", path)

        with open(cfg_syncpath_file, "r") as f:
            lines = f.readlines()
        with open(cfg_syncpath_file, "w") as f:
            for line in lines:
                if line.strip("\n") != path:
                    f.write(line)

#

    async def get_config(self):
        logger.debug("Executing: get_config()")
        with open(cfg_property_file) as f:
            lines = f.readlines()
            lines = list(map(lambda x: x.strip().split('='), lines))
            logger.debug("config %s", lines)
            return lines

    async def set_config(self, key: str, value: str):
        logger.debug("Executing: set_config(%s, %s)", key, value)
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


# Asyncio-compatible long-running code, executed in a task when the plugin is loaded


    async def _main(self):
        logger.debug("rclone exe path: %s", rclone_bin)
        logger.debug("rclone cfg path: %s", rclone_cfg)

        if not config_dir.is_dir():
            os.makedirs(config_dir, exist_ok=True)

        if not cfg_syncpath_file.is_file():
            cfg_syncpath_file.touch()
        if not cfg_property_file.is_file():
            cfg_property_file.touch()

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        await _kill_previous_spawn(self.current_spawn) # Kills only if exists
