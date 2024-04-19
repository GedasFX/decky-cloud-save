import { backend_call } from "./backend";
import * as logger from "./logger";

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
  return new Promise((resolve) => {
    (async () => {
      logger.info("Pausing PID " + pid)
      await pauseParent(pid);
      logger.info("Pausing children of PID " + pid)
      let cnt = 1;
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
  logger.info("Resuming PID " + pid + " and its children")
  return new Promise((resolve) => {
    (async () => {
      await resume(pid);
      return resolve(true)
    })()
  });
}