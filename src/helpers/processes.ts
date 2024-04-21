import { backend_call } from "./backend";

export async function signal(pid: number, s: 'SIGSTOP' | 'SIGCONT'): Promise<number> {
  return backend_call<{ pid: number, s: 'SIGSTOP' | 'SIGCONT' }, number>("signal", { pid, s });
}
