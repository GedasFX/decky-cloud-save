import os
import signal
import subprocess
import decky_plugin

def _get_process_tree(pid):
    ps_output = subprocess.check_output(["ps", "--ppid", str(pid), "--no-headers", "-o", "pid"])
    return [int(line.strip()) for line in ps_output.splitlines()]

def send_signal(pid: int, signal: signal.Signals):
    try:
        os.kill(pid, signal)
        decky_plugin.logger.info("Process with PID %d received signal %s.", pid, signal)

        child_pids = _get_process_tree(pid)

        for child_pid in child_pids:
            send_signal(child_pid, signal)
            
    except Exception as e:
         decky_plugin.logger.error("Error sending signal to process with PID %d: %s", pid, e)