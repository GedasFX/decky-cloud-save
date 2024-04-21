import os
import signal
import decky_plugin
import psutil

def _send_signal_int(pid: int, signal: signal.Signals):
    try:
        os.kill(pid, signal)
        decky_plugin.logger.info("Process with PID %d received signal %s.", pid, signal)
    except Exception as e:
        decky_plugin.logger.error("Error pausing process with PID %d: %s", pid, e)

def send_signal(pid: int, signal: signal.Signals):
    try:
        parent_process = psutil.Process(pid)
    except psutil.NoSuchProcess:
        decky_plugin.logger.error("Process with PID %d not found.", pid)
        return

    _send_signal_int(pid, signal)

    # Recursively send signal to child processes as pause on parent, does not pause chidren
    for child in parent_process.children(recursive=True):
        _send_signal_int(child.pid, signal)
