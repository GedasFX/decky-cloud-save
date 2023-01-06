import logging
import os
import re
import subprocess
import sys

# append py_modules to PYTHONPATH
plugin_dir = os.path.dirname(os.path.realpath(__file__))
rclone_bin = f"{plugin_dir}/bin/rclone"
rclone_cfg = f"{plugin_dir}/rclone.conf"
rclone_exe = [rclone_bin, "--config", rclone_cfg]

sys.path.append(plugin_dir + "/py_modules")

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


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

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded

    async def _main(self):
        logger.debug(f"rclone exe path: {rclone_bin}")
        logger.debug(f"rclone cfg path: {rclone_cfg}")
        logger.info("Hello World!")

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        if self.current_spawn is not None:
            self.current_spawn.kill()
