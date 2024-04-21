import signal
import decky_plugin
import plugin_config
import process_utils
from rclone_setup_manager import RcloneSetupManager
from rclone_sync_manager import RcloneSyncManager

class Plugin:
    manager_setup = RcloneSetupManager()
    manager_sync = RcloneSyncManager()

    async def log(self, level: str, msg: str) -> int:
        match level:
            case "debug":
                decky_plugin.logger.debug(msg)
            case "info":
                decky_plugin.logger.info(msg)
            case "warn":
                decky_plugin.logger.warn(msg)
            case "error":
                decky_plugin.logger.error(msg)

    async def getLastSyncLog(self) -> str:
        record: bool = False
        log: str = ""
        for line in reversed(list(open(decky_plugin.DECKY_PLUGIN_LOG))):
            if(record==False):
                if "Sync finished" in line:
                    record = True
            else:
                if "Running command: /home/deck/homebrew/plugins/decky-cloud-save/rclone" in line.strip():
                    return log
                else:
                    log = line + '\n' + log


    async def spawn(self, backend_type: str):
        return await self.manager_setup.spawn(backend_type)

    async def spawn_probe(self):
        return await self.manager_setup.probe()

    async def get_backend_type(self):
        return await self.manager_setup.get_backend_type()

    async def sync_now_internal(self, winner: str, resync: bool):
        return await self.manager_sync.sync_now(winner, resync)

    async def sync_now_probe(self):
        return await self.manager_sync.probe()
    
    async def signal(self, pid: int, s: str):
        decky_plugin.logger.debug("Executing: send_signal(%s)", pid, s)
        if s == "SIGSTOP":
            return process_utils.send_signal(pid, signal.SIGSTOP)
        elif s == "SIGCONT":
            return process_utils.send_signal(pid, signal.SIGCONT)


    async def get_config(self):
        decky_plugin.logger.debug("Executing: get_config()")
        return plugin_config.get_config()

    async def set_config(self, key: str, value: str):
        decky_plugin.logger.debug("Executing: set_config(%s, %s)", key, value)
        plugin_config.set_config(key, value)


    async def _main(self):
        decky_plugin.logger.debug("rclone exe path: %s", plugin_config.rclone_bin)
        decky_plugin.logger.debug("rclone cfg path: %s", plugin_config.rclone_cfg)


    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        self.manager_setup.__exit__()

    async def _migration(self):
        plugin_config.migrate()