import { Backend } from "./backend";

export class Processes {
  public static async signal(pid: number, s: 'SIGSTOP' | 'SIGCONT'): Promise<number> {
    return Backend.backend_call<{ pid: number, s: 'SIGSTOP' | 'SIGCONT' }, number>("signal", { pid, s });
  }
}
