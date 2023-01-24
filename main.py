import asyncio
import logging
import os
import re
import subprocess
from pathlib import Path

plugin_dir = Path(os.path.dirname(os.path.realpath(__file__)))
config_dir = (Path(plugin_dir) / "../../settings/decky-cloud-save").resolve()

rclone_bin = plugin_dir / "bin/rclone"
rclone_cfg = config_dir / "rclone.conf"
rclone_exe = [rclone_bin, "--config", rclone_cfg]

cfg_syncpath_file = config_dir / "sync_paths.txt"

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


async def _read_stream(stream, cb):
    while True:
        line = await stream.readline()
        if line:
            cb(line)
        else:
            break


async def _stream_subprocess(cmd, stdout_cb, stderr_cb):
    process = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)

    await asyncio.wait([
        _read_stream(process.stdout, stdout_cb),
        _read_stream(process.stderr, stderr_cb)
    ])

    return await process.wait()


def execute(cmd, stdout_cb, stderr_cb):
    loop = asyncio.get_event_loop()
    rc = loop.run_until_complete(
        _stream_subprocess(
            cmd,
            stdout_cb,
            stderr_cb,
        ))
    loop.close()
    return rc


def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


class Plugin:
    current_spawn = None

    async def spawn(self, backend_type: str):
        logger.debug(self.current_spawn)
        logger.info("Updating rclone.conf")
        if self.current_spawn is not None:
            logger.warn("Killing previous Popen")
            self.current_spawn.terminate()

        if is_port_in_use(53682):
            raise Exception('RCLONE_PORT_IN_USE')

        subprocess.run(rclone_exe + ["config", "touch"])

        if backend_type == "drive":
            additional_args = ["scope=drive.file"]
        else:
            additional_args = []

        self.current_spawn = subprocess.Popen(rclone_exe + ["config", "create", "backend", backend_type] + additional_args,
                                              stderr=subprocess.PIPE, universal_newlines=True, bufsize=1)
        logger.debug(self.current_spawn)

        line = self.current_spawn.stderr.readline()
        logger.debug(line)

        if line[:22] == "<5>NOTICE: Config file":
            line = self.current_spawn.stderr.readline()
            logger.debug(line)

        return re.search("(http:\/\/127\.0\.0\.1:53682\/auth\?state=.*)\\n$", line).groups()[0]

    async def spawn_callback(self):
        async for i in iter(self.current_spawn.stderr.readline, ""):
            logger.debug(i)
        logger.info("Updated rclone.conf")
        self.current_spawn = None

    async def spawn_nukeall(self):
        logger.debug("nukje")
        logger.debug(self.current_spawn)
        if self.current_spawn is not None:
            logger.warn("Killing previous Popen")
            self.current_spawn.terminate()

        asyncio.subprocess.create_subprocess_exec()

    async def get_backend_type(self):
        with open(rclone_cfg, "r") as f:
            l = f.readlines()
            return l[1]

#

    async def sync_now(self):
        subprocess.run(rclone_exe + ["copy", "--include-from",
                       cfg_syncpath_file, "/", "backend:decky-cloud-save", "--copy-links"])


#

    async def get_syncpaths(self):
        with open(cfg_syncpath_file, "r") as f:
            return f.readlines()

    async def test_syncpath(self, path: str):
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
            self.current_spawn.terminate()


# res = asyncio.run(Plugin().test_syncpath("/home/user/source/decky-cloud-save/**"))
# print(res)
