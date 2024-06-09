import { Backend } from "./backend";

/**
 * Represents log levels.
 */
enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * Represents a logging utility.
 */
export class Logger {

    private constructor() {
    }

    /**
     * The style for the logger prefix.
     */
    private static prefixStyle = "background-color: blue; color: white; font-weight: bold";

    /**
     * Styles for different log levels.
     */
    private static levelStyles: { [key in LogLevel]: string } = {
        [LogLevel.DEBUG]: "background-color: PowderBlue; font-weight:bold;",
        [LogLevel.INFO]: "background-color: PaleGreen; font-weight:bold",
        [LogLevel.WARN]: "background-color: Gold; font-weight:bold",
        [LogLevel.ERROR]: "background-color: LightSalmon; font-weight:bold",
    };

    /**
     * The prefix for log messages.
     */
    private static prefix: string = "Decky Cloud Save";

    /**
     * The current log level.
     */
    private static currentLevel = LogLevel.INFO;

    /**
     * Initializes the logger.
     */
    public static async initialize() {
        const level: string = await Backend.getLogLevel();
        Logger.currentLevel = LogLevel[level as keyof typeof LogLevel];
        Logger.log(LogLevel.INFO, "Logger initialized at level '" + LogLevel[Logger.currentLevel] + "'");
    }

    /**
     * Logs a message.
     * @param lvl - The log level.
     * @param args - The message arguments.
     */
    private static log(lvl: LogLevel, ...args: any) {
        if (Logger.isLevelEnabled(lvl)) {
            Backend.log(LogLevel[lvl], ...args);
            console.log("%c %s %c %s ", Logger.prefixStyle, Logger.prefix, Logger.levelStyles[lvl], LogLevel[lvl], ...args);
        }
    }

    /**
     * Checks if a log level is enabled.
     * @param lvl - The log level.
     * @returns True if the log level is enabled, otherwise false.
     */
    private static isLevelEnabled(lvl: LogLevel): boolean {
        return Logger.currentLevel <= lvl;
    }

    /**
     * Logs a debug message.
     * @param args - The message arguments.
     */
    public static debug(...args: any) {
        Logger.log(LogLevel.DEBUG, ...args);
    }

    /**
     * Logs an info message.
     * @param args - The message arguments.
     */
    public static info(...args: any) {
        Logger.log(LogLevel.INFO, ...args);
    }

    /**
     * Logs a warning message.
     * @param args - The message arguments.
     */
    public static warn(...args: any) {
        Logger.log(LogLevel.WARN, ...args);
    }

    /**
     * Logs an error message.
     * @param args - The message arguments.
     */
    public static error(...args: any) {
        Logger.log(LogLevel.ERROR, ...args);
    }
}