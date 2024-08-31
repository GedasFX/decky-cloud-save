from asyncio import create_subprocess_exec
from asyncio.subprocess import Process
import subprocess
import decky_plugin
import plugin_config
import os
import os.path
from glob import glob


class RcloneSyncManager:
    current_sync: Process | None = None

    async def delete_lock_files(self):
        """
        Deletes rclone lock files
        """
        decky_plugin.logger.info("Deleting lock files.")
        for hgx in glob(decky_plugin.HOME + "/.cache/rclone/bisync/*.lck"):
            os.remove(hgx)

    async def sync_now(self, winner: str, resync: bool):
        """
        Initiates a synchronization process using rclone.

        Parameters:
        winner (str): The winner of any conflicts during synchronization.
        resync (bool): Whether to perform a resynchronization.

        """
        args = []

        bisync_enabled = plugin_config.get_config_item("bisync_enabled", "false") == "true"
        destination_path = plugin_config.get_config_item("destination_directory", "decky-cloud-save")
        sync_root = plugin_config.get_config_item("sync_root", "/")
        
        additional_args = [x for x in plugin_config.get_config_item("additional_sync_args", "").split(' ') if x]

        if bisync_enabled:
            args.extend(["bisync"])
            decky_plugin.logger.debug("Using bisync")
        else:
            args.extend(["copy"])
            decky_plugin.logger.debug("Using copy")

        args.extend([sync_root, f"backend:{destination_path}", "--filter-from",
                    plugin_config.cfg_syncpath_filter_file, "--copy-links"])
        if bisync_enabled:
            if resync:
                args.extend(["--resync-mode", winner, "--resync"])
            else:
                args.extend(["--conflict-resolve", winner])

        args.extend(["--transfers", "8", "--checkers", "16", "--log-file",
                    decky_plugin.DECKY_PLUGIN_LOG, "--log-format", "none", "-v"])
        
        args.extend(additional_args)

        cmd = [plugin_config.rclone_bin, *args]

        decky_plugin.logger.info("=== STARTING SYNC ===")

        decky_plugin.logger.info(
            "Running command: %s", subprocess.list2cmdline(cmd))
        self.current_sync = await create_subprocess_exec(*cmd)

    async def probe(self):
        """
        Checks if the current synchronization process is running.

        Returns:
        int: The return code of the synchronization process.
        """
        if not self.current_sync:
            return 0
        
        if self.current_sync.returncode is not None:
            decky_plugin.logger.info("=== FINISHING SYNC ===")

        return self.current_sync.returncode