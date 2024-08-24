import os
from pathlib import Path
import decky_plugin
from settings import SettingsManager as settings_manager

# Plugin directories and files
plugin_dir = Path(decky_plugin.DECKY_PLUGIN_DIR)
config_dir = Path(decky_plugin.DECKY_PLUGIN_SETTINGS_DIR)

rclone_bin = plugin_dir / "bin/rcloneLauncher"
rclone_cfg = config_dir / "rclone.conf"

cfg_syncpath_includes_file = config_dir / "sync_paths.txt"
cfg_syncpath_excludes_file = config_dir / "sync_paths_excludes.txt"
cfg_syncpath_filter_file = config_dir / "sync_paths_filter.txt"

config = settings_manager(name="config", settings_directory=decky_plugin.DECKY_PLUGIN_SETTINGS_DIR)

def get_cfg_property():
    """
    Reads and parses the plugin.properties.
    This is only used for migration from legacy config file and should not be used for any other purpose.

    Returns:
    list: A list of key-value pairs representing the configuration.
    """
    cfg_property_file = config_dir / "plugin.properties"
    if not cfg_property_file.is_file():
        return []
    with open(cfg_property_file) as f:
        lines = f.readlines()
        lines = list(map(lambda x: x.strip().split('='), lines))
        decky_plugin.logger.debug("config %s", lines)
        cfg_property_file.unlink()
        return lines

def get_config():
    """
    Retrieves the plugin configuration.

    Returns:
    dict: The plugin configuration.
    """
    config.read()
    return config.settings

def set_config(key: str, value):
    """
    Sets a configuration key-value pair in the plugin configuration file.

    Parameters:
    key (str): The key to set.
    value (str): The value to set for the key.
    """
    config.setSetting(key, value)

def get_config_item(name: str, default = None):
    """
    Retrieves a configuration item by name.

    Parameters:
    name (str): The name of the configuration item.
    default (str, optional): The default value if the item is not found. Defaults to None.

    Returns:
    str: The value of the configuration item.
    """
    config.read()
    return config.getSetting(name, default)

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

def get_library_sync_config(key: str = None):
    """
    Retrieves the library sync configuration.

    Parameters:
    key (str, optional): The key of the value to retrieve. If not provided, the entire configuration will be returned.

    Returns:
    dict: The library sync configuration.
    """
    config.read()
    if key:
        return config.getSetting("library_sync", {}).get(key, {"enabled": False, "bisync": False, "destination": f"deck-libraries/{key}"})
    else:
        return config.getSetting("library_sync", {})

def set_library_sync_config(key: str, enabled: bool = None, bisync: bool = None, destination: str = None):
    """
    Sets the library sync configuration.

    Parameters:
    key (str): The key to set.
    enabled (bool): Whether the key is enabled.
    destination (str): The destination of the key.
    """
    config.read()
    if enabled == None:
        enabled = get_library_sync_config(key).get("enabled", False)
    if bisync == None:
        bisync = get_library_sync_config(key).get(key, {}).get("bisync", False)
    if destination == None:
        destination = get_library_sync_config(key).get(key, {}).get("destination", f"deck-libraries/{key}")
    library_sync_config = get_library_sync_config()
    library_sync_config.update({key: {"enabled": enabled, "bisync": bisync, "destination": destination}})
    config.setSetting("library_sync", library_sync_config)

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
    if not cfg_syncpath_filter_file.is_file():
        regenerate_filter_file()

    # Migrate from plugin.properties to config.json
    config_pairs_list = get_cfg_property()
    for pair in config_pairs_list:
        if pair[1] == "true":
            pair[1] = True
        elif pair[1] == "false":
            pair[1] = False
        set_config(pair[0], pair[1])

    # Set default configurations
    current_config = get_config()
    if not "destination_directory" in current_config:
        set_config("destination_directory", "decky-cloud-save")
    if not "bisync_enabled" in current_config:
        set_config("bisync_enabled", False)
    if not "log_level" in current_config:
        set_config("log_level", "INFO")
    if not "sync_on_game_exit" in current_config:
        set_config("sync_on_game_exit", True)
    if not "toast_auto_sync" in current_config:
        set_config("toast_auto_sync", True)
    if not "additional_sync_args" in current_config:
        set_config("additional_sync_args", [])
    if not "library_sync" in current_config:
        set_library_sync_config("Documents")
        set_library_sync_config("Music")
        set_library_sync_config("Pictures")
        set_library_sync_config("Videos")
