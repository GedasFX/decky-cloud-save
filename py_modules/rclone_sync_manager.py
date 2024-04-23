from asyncio import create_subprocess_exec
from asyncio.subprocess import Process
import subprocess
import decky_plugin
import plugin_config

class RcloneSyncManager:
    current_sync: Process | None = None

    async def sync_now(self, winner: str, resync: bool):
        bisync_enabled = plugin_config.get_config_item("bisync_enabled", "false") == "true"
        destination_path = plugin_config.get_config_item("destination_directory", "decky-cloud-save")
        args = []

        if bisync_enabled:
            args.extend(["bisync"])
            decky_plugin.logger.debug("Using bisync")
        else: 
            args.extend(["copy"])
            decky_plugin.logger.debug("Using copy")

        args.extend(["/", f"backend:{destination_path}", "--filter-from", plugin_config.cfg_syncpath_filter_file, "--copy-links"])
        if bisync_enabled:
            if resync:
                args.extend(["--resync-mode", winner, "--resync"])
            else:
                args.extend(["--conflict-resolve", winner])

        args.extend(["--transfers", "8", "--checkers", "16", "--log-file", decky_plugin.DECKY_PLUGIN_LOG, "--log-format", "none", "-v"])  

        cmd = [plugin_config.rclone_bin, *args]
        decky_plugin.logger.info("Running command: %s", subprocess.list2cmdline(cmd))

        self.current_sync = await create_subprocess_exec(*cmd)

    async def probe(self):
        if not self.current_sync:
            return 0
        
        return self.current_sync.returncode