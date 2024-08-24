import { ServerAPI } from "decky-frontend-lib";

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class Backend {

    /**
     * Private constructor to prevent instantiation
     */
    private constructor() {
    }

    /**
     * Static instance of ServerAPI to handle API calls
     */
    private static serverApi: ServerAPI = null!;

    /**
     * Method to initialize the server API
     * @param serverApi - An instance of ServerAPI
     */
    public static initialize(serverApi: ServerAPI) {
        Backend.serverApi = serverApi;
    }

    /**
     * Generic method to make backend calls to Python plugin methods
     * @param name - The name of the method to call
     * @param params - The parameters to pass to the method
     * @returns A Promise of the result type
     */
    private static async backend_call<I, O>(name: string, params: I): Promise<O> {
        try {
            const res = await Backend.serverApi.callPluginMethod<I, O>(name, params);
            if (res.success) {
                let result = res.result;
                return result;
            } else {
                let result = res.result;
                throw result;
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * Method that delete lock files
     * @returns A Promise of the result type
     */
    public static async deleteLockFiles(): Promise<void> {
        return Backend.backend_call<{}, void>("delete_lock_files", {});
    }

    /**
     * Method to send a signal to a process
     * @param pid - The process ID
     * @param s - The signal type ('SIGSTOP' or 'SIGCONT')
     * @returns A Promise of the result type
     */
    public static async signal(pid: number, s: 'SIGSTOP' | 'SIGCONT'): Promise<number> {
        return Backend.backend_call<{ pid: number, s: 'SIGSTOP' | 'SIGCONT' }, number>("signal", { pid, s });
    }

    /**
     * Method to get the last sync log
     * @returns A Promise of the log as a string
     */
    public static async getLastSyncLog(): Promise<string> {
        return Backend.backend_call<{}, string>("get_last_sync_log", {});
    }

    /**
     * Method to get the plugin log
     * @returns A Promise of the log as a string
     */
    public static async getPluginLog(): Promise<string> {
        return Backend.backend_call<{}, string>("get_plugin_log", {});
    }

    /**
     * Method to get the log level
     * @returns A Promise of the log level as a string
     */
    public static async getLogLevel(): Promise<string> {
        return Backend.backend_call<{}, string>("get_log_level", {});
    }

    /**
     * Method to log a message
     * @param lvl - The log level
     * @param args - The arguments to log
     * @returns A Promise that resolves when the log is complete
     */
    public static async log(lvl: string, ...args: any): Promise<void> {
        return Backend.backend_call<{ level: string, msg: string }, void>("log", { level: lvl, msg: `[UI]: ${JSON.stringify(args)}` });
    }
}