import os
from pathlib import Path
import decky_plugin

# Plugin directories and files
plugin_dir = Path(decky_plugin.DECKY_PLUGIN_DIR)
config_dir = Path(decky_plugin.DECKY_PLUGIN_SETTINGS_DIR)

rclone_bin = plugin_dir / "bin/rcloneLauncher"
rclone_cfg = config_dir / "rclone.conf"

cfg_syncpath_includes_file = config_dir / "sync_paths.txt"
cfg_syncpath_excludes_file = config_dir / "sync_paths_excludes.txt"
cfg_syncpath_filter_file = config_dir / "sync_paths_filter.txt"
cfg_property_file = config_dir / "plugin.properties"

def get_config(): 
    """
    Reads and parses the plugin configuration file.

    Returns:
    list: A list of key-value pairs representing the configuration.
    """
    with open(cfg_property_file) as f:
        lines = f.readlines()
        lines = list(map(lambda x: x.strip().split('='), lines))
        decky_plugin.logger.debug("config %s", lines)
        return lines

def set_config(key: str, value: str):
    """
    Sets a configuration key-value pair in the plugin configuration file.

    Parameters:
    key (str): The key to set.
    value (str): The value to set for the key.
    """
    with open(cfg_property_file, "r") as f:
        lines = f.readlines()
    with open(cfg_property_file, "w") as f:
        found = False
        for line in lines:
            if line.startswith(key + '='):
                f.write(f"{key}={value}\n")
                found = True
            else:
                f.write(line)
        if not found:
            f.write(f"{key}={value}\n")

def get_config_item(name: str, default: str = None):
    """
    Retrieves a configuration item by name.

    Parameters:
    name (str): The name of the configuration item.
    default (str, optional): The default value if the item is not found. Defaults to None.

    Returns:
    str: The value of the configuration item.
    """
    return next((x[1] for x in get_config() if x[0] == name), default)

def regenerate_filter_file():
    """
    Regenerates the sync paths filter file based on includes and excludes files.
    """
    with open(cfg_syncpath_includes_file, 'r') as f:
        includes = f.readlines()
    with open(cfg_syncpath_excludes_file, 'r') as f:
        excludes = f.readlines()
    with open(cfg_syncpath_filter_file, 'w') as f:
        f.write("# Last line of this file MUST be '- **' (exclude the rest) as otherwise you will start backing up the entire steam deck!\n")
        f.write("# If you are editing this file manually, make sure to not use the UI file picker, as the saves done there will overwrite.\n")
        f.write("# Examples: https://rclone.org/filtering/#examples\n")
        f.write("\n")
        for exclude in excludes:
            f.write(f"- {exclude}")
        f.write("\n")
        for include in includes:
            f.write(f"+ {include}")
        f.write("\n")
        f.write("- **\n")

def migrate():
    """
    Performs migration tasks if necessary, like creating directories and files, and setting default configurations.
    """
    if not config_dir.is_dir():
        os.makedirs(config_dir, exist_ok=True)
    if not cfg_syncpath_includes_file.is_file():
        cfg_syncpath_includes_file.touch()
    if not cfg_syncpath_excludes_file.is_file():
        cfg_syncpath_excludes_file.touch()
    if not cfg_property_file.is_file():
        cfg_property_file.touch()
    if not cfg_syncpath_filter_file.is_file():
        regenerate_filter_file()

    config = get_config()
    if not any(e[0] == "destination_directory" for e in config):
        set_config("destination_directory", "decky-cloud-save")
    if not any(e[0] == "bisync_enabled" for e in config):
        set_config("bisync_enabled", "false")
    if not any(e[0] == "log_level" for e in config):
        set_config("log_level", "INFO")
    if not any(e[0] == "sync_on_game_exit" for e in config):
        set_config("sync_on_game_exit", "true")
    if not any(e[0] == "toast_auto_sync" for e in config):
        set_config("toast_auto_sync", "true")
    if not any(e[0] == "additional_sync_args" for e in config):
        set_config("additional_sync_args", "")
    if not any(e[0] == "sync_root" for e in config):
        set_config("sync_root", "/")
