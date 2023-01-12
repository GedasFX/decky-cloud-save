import asyncio
import logging
import os
import re
import signal
import subprocess
import sys
from glob import glob
from pathlib import Path

plugin_dir = Path(os.path.dirname(os.path.realpath(__file__)))
config_dir = (Path(plugin_dir) / "../../settings/decky-cloud-save").resolve()

rclone_bin = plugin_dir / "bin/rclone"
rclone_cfg = config_dir / "rclone.conf"
rclone_exe = [rclone_bin, "--config", rclone_cfg]

cfg_syncpath_file = config_dir / "sync_paths.txt"

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


async def analyze_shit(path: str):
    files = [f for f in glob(path, recursive=True) if os.path.isfile(f)]
    # print("test_syncpath: Path %s matched %i files: %s", path, len(files), files)
    return len(files)


class timeout:
    def __init__(self, seconds=1, error_message='Timeout'):
        self.seconds = seconds
        self.error_message = error_message

    def handle_timeout(self, signum, frame):
        print("asdasdasdasdasdasd")
        raise TimeoutError(self.error_message)

    def __enter__(self):
        signal.signal(signal.SIGALRM, self.handle_timeout)
        signal.alarm(self.seconds)

    def __exit__(self, type, value, traceback):
        signal.alarm(0)


class Plugin:
    current_spawn = None

    async def spawn(self, backend_type: str):
        logger.info("Updating rclone.conf")
        if self.current_spawn is not None:
            logger.warn("Killing previous Popen")
            self.current_spawn.kill()

        if is_port_in_use(53682):
            raise Exception('RCLONE_PORT_IN_USE')

        subprocess.run(rclone_exe + ["config", "touch"])
        self.current_spawn = subprocess.Popen(rclone_exe + ["config", "create", "backend", backend_type],
                                              stderr=subprocess.PIPE, universal_newlines=True, bufsize=1)

        line = self.current_spawn.stderr.readline()
        logger.debug(line)

        if line[:22] == "<5>NOTICE: Config file":
            line = self.current_spawn.stderr.readline()
            logger.debug(line)

        return re.search("(http:\/\/127\.0\.0\.1:53682\/auth\?state=.*)\\n$", line).groups()[0]

    async def spawn_callback(self):
        for i in iter(self.current_spawn.stderr.readline, ""):
            logger.debug(i)
        logger.info("Updated rclone.conf")
        self.current_spawn = None

#

    async def sync_now(self):
        subprocess.run(rclone_exe + ["sync", "--filter-from",
                       f"{plugin_dir}/syncpaths.txt", "/home/deck", "backend:decky-cloud-save"])

#

    async def get_syncpaths(self):
        with open(cfg_syncpath_file, "r") as f:
            return f.readlines()

    async def test_syncpath(self, path: str):
        count = 0
        for root, os_dirs, os_files in os.walk(path):
            for file in os_files:
                count += 1
                if count == 9001:
                    return "Over 9000 files"
        
        print(len(files))
        # try:
        #     with timeout(1):
        #         files = [f for f in glob(
        #             path, recursive=True) if os.path.isfile(f)]
        #         # print("test_syncpath: Path %s matched %i files: %s", path, len(files), files)
        #         return len(files)
        #     # a = subprocess.check_output(
        #     #     ("find", path, "-type",  "f", "-printf", "."), timeout=1)
        #     # logger.debug(a)
        #     # return a
        # except TimeoutError:
        #     raise Exception("Too many items!")

        # items = glob(path, recursive=True)
        # logger.debug(
        #     f"test_syncpath: Matching items for path '{path}':\n" + "\n".join(items))
        # items = [f for f in items if os.path.isfile(f)]
        # logger.debug(
        #     f"test_syncpath: Matching files for path '{path}':\n" + "\n".join(items))
        # return len(items)

    async def add_syncpath(self, path: str):
        logger.info(f"Adding Path to Sync: '{path}'")

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
        logger.info(f"Removing Path from Sync: '{path}'")
        with open(cfg_syncpath_file, "r") as f:
            lines = f.readlines()
        with open(cfg_syncpath_file, "w") as f:
            for line in lines:
                if line.strip("\n") != path:
                    f.write(line)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded

    async def _main(self):
        logger.debug(f"rclone exe path: {rclone_bin}")
        logger.debug(f"rclone cfg path: {rclone_cfg}")

        if not config_dir.is_dir():
            os.makedirs(config_dir, exist_ok=True)

        if not cfg_syncpath_file.is_file():
            cfg_syncpath_file.touch()

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        if self.current_spawn is not None:
            self.current_spawn.kill()


asyncio.run(Plugin().test_syncpath("/"))

