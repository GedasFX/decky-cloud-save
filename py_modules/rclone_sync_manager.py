from asyncio import create_subprocess_exec
from asyncio.subprocess import Process
import subprocess
import decky_plugin
import plugin_config
import os
import os.path
from pathlib import Path


class RcloneSyncManager:
    current_sync: Process | None = None

    async def delete_lock_files(self):
        """
        Deletes rclone lock files
        """
        args = [decky_plugin.HOME + "/.cache/rclone/bisync/*.lck"]
        cmd = ["rm", *args]
        decky_plugin.logger.info(
            "Running command: %s", subprocess.list2cmdline(cmd))
        await create_subprocess_exec(*cmd)

    async def sync_now(self, winner: str, resync: bool):
        destination_path = plugin_config.get_config_item("destination_directory", "decky-cloud-save")
        await self.sync_now_internal(
            ["/", f"backend:{destination_path}", "--filter-from", plugin_config.cfg_syncpath_filter_file],
            plugin_config.get_config_item("bisync_enabled", "false") == "true",
            winner,
            resync
        )

        for k, v in plugin_config.get_library_sync_config().items():
            if v.get("enabled", False):
                await self.sync_now_internal(
                    [str(Path.home() / k), f"backend:{v.get('destination', f'deck-libraries/{k}')}"],
                    v.get("bisync", False),
                    winner,
                    resync
                )

    async def sync_now_internal(self, path_args: list, bisync: bool, winner: str, resync: bool):
        """
        Initiates a synchronization process using rclone.

        Parameters:
        winner (str): The winner of any conflicts during synchronization.
        resync (bool): Whether to perform a resynchronization.

        """
        args = []

        if bisync:
            args.extend(["bisync"])
            decky_plugin.logger.debug("Using bisync")
        else:
            args.extend(["copy"])
            decky_plugin.logger.debug("Using copy")

        args.extend(path_args)
        args.extend(["--copy-links"])
        if bisync_enabled:
            if resync:
                args.extend(["--resync-mode", winner, "--resync"])
            else:
                args.extend(["--conflict-resolve", winner])

        args.extend(["--transfers", "8", "--checkers", "16", "--log-file",
                    decky_plugin.DECKY_PLUGIN_LOG, "--log-format", "none", "-v"])

        cmd = [plugin_config.rclone_bin, *args]
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

        return self.current_sync.returncode

    async def needs_resync(self):
        """
        Checks if resync if needed.

        Returns:
        bool: is needed
        """
        dirPath = decky_plugin.HOME + "/.cache/rclone/bisync"
        if not os.path.isdir(dirPath):
            return True
        else:
            return len([name for name in os.listdir(dirPath)]) == 0
