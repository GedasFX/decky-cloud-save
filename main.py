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
rclone_cfg_arg = ["--config", rclone_cfg]

cfg_syncpath_file = config_dir / "sync_paths.txt"

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


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
        logger.info("Updating rclone.conf")

        await _kill_previous_spawn(self.current_spawn)
        if _is_port_in_use(53682):
            raise Exception('RCLONE_PORT_IN_USE')

        if backend_type == "drive":
            additional_args = ["scope=drive.file"]
        else:
            additional_args = []

        self.current_spawn = await asyncio.subprocess.create_subprocess_exec(rclone_bin, *(rclone_cfg_arg + ["config", "create", "backend", backend_type] + additional_args), stderr=asyncio.subprocess.PIPE)

        url = await _get_url_from_rclone_process(self.current_spawn)
        logger.info("Login URL: %s", url)

        return url

    async def spawn_probe(self):
        if not self.current_spawn:
            return 0

        return self.current_spawn.returncode

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

async def r():
    pl = Plugin()
    url = await pl.spawn('onedrive')
    print(url)
    url = await pl.spawn('onedrive')
    print(url)

# res = asyncio.run(Plugin().spawn('onedrive'))
# print(res)

# asyncio.run(r())
