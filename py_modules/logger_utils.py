import decky_plugin


def log(level: str, msg: str) -> int:
    """
    Logs a message with the specified level.

    Parameters:
    level (str): The level of the log message ('debug', 'info', 'warn', or 'error').
    msg (str): The message to log.

    Returns:
    int: The status code indicating the success of the logging operation.
    """
    match level.lower():
        case "debug":
            decky_plugin.logger.debug(msg)
        case "info":
            decky_plugin.logger.info(msg)
        case "warn":
            decky_plugin.logger.warn(msg)
        case "error":
            decky_plugin.logger.error(msg)


def get_last_sync_log() -> str:
    """
    Retrieves the last synchronization log.

    Returns:
    str: The last synchronization log.
    """
    record: bool = False
    log: str = ""
    with open(decky_plugin.DECKY_PLUGIN_LOG) as f:
        for line in reversed(list(f)):
            if(record == False):
                if "=== FINISHING SYNC ===" in line:
                    record = True
            else:
                if "=== STARTING SYNC ===" in line:
                    break
                else:
                    log = line + '\n' + log  
    return log

def get_plugin_log() -> str:
    """
    Retrieves the entire plugin log.

    Returns:
    str: The plugin log.
    """
    log: str = ""
    with open(decky_plugin.DECKY_PLUGIN_LOG) as f:
        for line in reversed(list(f)):
            log = line + '\n' + log  
            if "Logger initialized at level" in line.strip():
                break
    return log
