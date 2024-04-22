import os
from pathlib import Path
import decky_plugin


plugin_dir = Path(decky_plugin.DECKY_PLUGIN_DIR)
config_dir = Path(decky_plugin.DECKY_PLUGIN_SETTINGS_DIR)

rclone_bin = plugin_dir / "bin/rcloneLauncher"
rclone_cfg = config_dir / "rclone.conf"

cfg_syncpath_includes_file = config_dir / "sync_paths.txt"
cfg_syncpath_excludes_file = config_dir / "sync_paths_excludes.txt"
cfg_syncpath_filter_file = config_dir / "sync_paths_filter.txt"
cfg_property_file = config_dir / "plugin.properties"

def get_config(): 
    with open(cfg_property_file) as f:
        lines = f.readlines()
        lines = list(map(lambda x: x.strip().split('='), lines))
        decky_plugin.logger.debug("config %s", lines)
        return lines

def set_config(key: str, value: str):
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
    return next((x[1] for x in get_config() if x[0] == name), default)

def regenerate_filter_file():
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
    if not any(e[0] == "experimental_menu" for e in config):
        set_config("experimental_menu", "false")