import logging
import os
import pathlib
import re
import subprocess
import sys

plugin_dir = os.path.dirname(os.path.realpath(__file__))
rclone_bin = f"{plugin_dir}/bin/rclone"
rclone_cfg = f"{plugin_dir}/rclone.conf"
rclone_exe = [rclone_bin, "--config", rclone_cfg]

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


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

    async def sync_now(self):
        subprocess.run(rclone_exe + ["sync", "--filter-from",
                       f"{plugin_dir}/syncpaths.txt", "/home/deck", "backend:decky-cloud-save"])

    async def get_syncpaths(self):
        with open(f"{plugin_dir}/syncpaths.txt", "r", encoding="utf-8") as f:
            return "\n".join(f.readlines())

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded

    async def _main(self):
        logger.debug(f"rclone exe path: {rclone_bin}")
        logger.debug(f"rclone cfg path: {rclone_cfg}")

        sync_paths = pathlib.Path(f"{plugin_dir}/syncpaths.txt")
        if not sync_paths.is_file():
            with open(sync_paths, "w", encoding="utf-8") as f:
                f.writelines(line + '\n' for line in [
                    "# # Is used for comments",
                    "# + Adds files",
                    "# - Ignores files",
                    "",
                    "# Root sync path is /home/deck, which means that path '+ Desktop' will keep everything in Desktop",
                    "# Rules can get really complex, and I suggest you go trough https://rclone.org/filtering/#filter-from-read-filtering-patterns-from-a-file",
                    "",
                    "# Add Rules below",
                    "# Games/epic-games-store/drive_c/users/deck/Saved Games/**",
                    "# Games/epic-games-store/drive_c/users/deck/Documents/**",
                    "",
                    "# IT IS VERY IMPORTANT THAT THE LAST LINE OF THIS FILE IS '- *'! OTHERWISE YOU WILL START BACKING UP THE ENTIRE STEAM DECK!",
                    "- *"
                ])

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        if self.current_spawn is not None:
            self.current_spawn.kill()
