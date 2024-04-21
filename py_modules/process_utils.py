import os
import signal
import subprocess
import decky_plugin

def _get_process_tree(pid):
    children = []
    with subprocess.Popen(["ps", "--ppid", str(pid), "-o", "pid="], stdout=subprocess.PIPE) as p:
        lines = p.stdout.readlines()
    for chldPid in lines:
        chldPid = chldPid.strip()
        if not chldPid:
            continue
        children.extend([int(chldPid.decode())])

    return children;

def send_signal(pid: int, signal: signal.Signals):
    try:
        os.kill(pid, signal)
        decky_plugin.logger.info("Process with PID %d received signal %s.", pid, signal)

        child_pids = _get_process_tree(pid)

        for child_pid in child_pids:
            send_signal(child_pid, signal)
            
    except Exception as e:
         decky_plugin.logger.error("Error sending signal to process with PID %d: %s", pid, e)