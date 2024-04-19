import { backend_call } from "./backend";

const prefix: string = "DCS - ";

function log(lvl: string, ...args: any) {
    backend_call<{ level: string, msg: string }, void>("log", { level: lvl, msg: "" + args });
}

export function info(...args: any) {
    log("info", ...args);
    console.info(prefix, ...args);
}

export function debug(...args: any) {
    log("debug", ...args);
    console.debug(prefix, ...args);
}

export function warn(...args: any) {
    log("warn", ...args);
    console.warn(prefix, ...args);
}

export function error(...args: any) {
    log("error", ...args);
    console.error(prefix, ...args);
}