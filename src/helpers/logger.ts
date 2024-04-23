import { Backend } from "./backend";

enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {

    private static prefixStyle = "background-color: blue; color: white; font-weight: bold";

    private static levelStyles: { [key in LogLevel]: string } = {
        [LogLevel.DEBUG]: "background-color: PowderBlue; font-weight:bold;",
        [LogLevel.INFO]: "background-color: PaleGreen; font-weight:bold",
        [LogLevel.WARN]: "background-color: Gold; font-weight:bold",
        [LogLevel.ERROR]: "background-color: LightSalmon; font-weight:bold",
    };

    private static prefix: string = "Decky Cloud Save";
    private static currentLevel = LogLevel.INFO;

    public static async initialize() {
        const level: string = await Backend.backend_call<{}, string>("get_log_level", {});
        Logger.currentLevel = LogLevel[level as keyof typeof LogLevel];
        Logger.log(LogLevel.INFO, "Logger initialized at level '" + LogLevel[Logger.currentLevel] + "'");
    }

    private static log(lvl: LogLevel, ...args: any) {
        if (Logger.isLevelEnabled(lvl)) {
            Backend.backend_call<{ level: string, msg: string }, void>("log", { level: LogLevel[lvl], msg: "" + args });
            console.log("%c %s %c %s ", Logger.prefixStyle, Logger.prefix, Logger.levelStyles[lvl], LogLevel[lvl], ...args);
        }
    }
    private static isLevelEnabled(lvl: LogLevel): boolean {
        return Logger.currentLevel <= lvl;
    }

    public static debug(...args: any) {
        Logger.log(LogLevel.DEBUG, ...args);
    }

    public static info(...args: any) {
        Logger.log(LogLevel.INFO, ...args);
    }

    public static warn(...args: any) {
        Logger.log(LogLevel.WARN, ...args);
    }

    public static error(...args: any) {
        Logger.log(LogLevel.ERROR, ...args);
    }
}