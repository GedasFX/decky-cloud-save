import logging
import os
import re
import subprocess
import sys

# append py_modules to PYTHONPATH
plugin_dir = os.path.dirname(os.path.realpath(__file__))
rclone_bin = f"{plugin_dir}/bin/rclone"
rclone_exe = [rclone_bin, "--config", f"{plugin_dir}/rclone.conf"]


sys.path.append(plugin_dir + "/py_modules")


# logging.basicConfig(filename="/tmp/template.log",
#                     format='[Template] %(asctime)s %(levelname)s %(message)s',
#                     filemode='w+',
#                     force=True)
logger = logging.getLogger()
# can be changed to logging.DEBUG for debugging issues
logger.setLevel(logging.DEBUG)


def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


class Plugin:
    current_spawn = None

    async def spawn(self, backend_type: str):

        if self.current_spawn is not None:
            self.current_spawn.kill()

        if is_port_in_use(53682):
            raise Exception('RCLONE_PORT_IN_USE')

        self.current_spawn = subprocess.Popen(rclone_exe + ["config", "create", "backend", backend_type],
                                              stderr=subprocess.PIPE, universal_newlines=True, bufsize=1)

        line = self.current_spawn.stderr.readline()
        if line[:19] == "NOTICE: Config file": line = self.current_spawn.stderr.readline()
        self.current_spawn.stderr.close()

        logger.debug(line)

        return re.search("(http:\/\/127\.0\.0\.1:53682\/auth\?state=.*)\\n$", line).groups()[0]

    async def spawn_callback(self):
        self.current_spawn.wait()

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded

    async def _main(self):
        logger.info("Hello World!")

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        if self.current_spawn is not None:
            self.current_spawn.wait()
