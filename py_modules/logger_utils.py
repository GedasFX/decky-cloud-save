import decky_plugin


def log(level: str, msg: str) -> int:
    match level.lower():
        case "debug":
            decky_plugin.logger.debug(msg)
        case "info":
            decky_plugin.logger.info(msg)
        case "warn":
            decky_plugin.logger.warn(msg)
        case "error":
            decky_plugin.logger.error(msg)


def getLastSyncLog() -> str:
    record: bool = False
    log: str = ""
    for line in reversed(list(open(decky_plugin.DECKY_PLUGIN_LOG))):
        if(record==False):
            if "Sync finished" in line:
                record = True
        else:
            if "Running command: /home/deck/homebrew/plugins/decky-cloud-save/bin/rcloneLauncher" in line.strip():
                break
            else:
                log = line + '\n' + log  
    return log

def getPluginLog() -> str:
    log: str = ""
    for line in list(open(decky_plugin.DECKY_PLUGIN_LOG)):
        log = log + line + '\n' 
    return log