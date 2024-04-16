import { backend_call, log } from "./utils";

export async function pauseParent(pid: number): Promise<number> {
  return backend_call<{ pid: number }, number>("pauseParent", { pid });
}

export async function pause(pid: number): Promise<number> {
  return backend_call<{ pid: number }, number>("pause", { pid });
}

export async function resume(pid: number): Promise<number> {
  return backend_call<{ pid: number }, number>("resume", { pid });
}
export async function suspendGame(pid: number): Promise<boolean> {
  log("Pausing PID " + pid)
  return new Promise((resolve) => {
    (async () => {
      await pauseParent(pid);
      let cnt = 0;
      while (true) {
        let cur = await pause(pid);
        if (cur < 0 || cur <= cnt) {
          break;
        } else {
          cnt = cur;
        }
      }
      return resolve(true)
    })()
  });
}
export async function resumeGame(pid: number): Promise<boolean> {
  log("Resuming PID " + pid)
  return new Promise((resolve) => {
    (async () => {
      await resume(pid);
      return resolve(true)
    })()
  });
}