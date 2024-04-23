import { ServerAPI } from "decky-frontend-lib";

export class Backend {

    public static instance: Backend;

    private _serverApi: ServerAPI = null!;

    public static initialize(serverApi: ServerAPI) {
        Backend.instance = new Backend();
        Backend.instance._serverApi = serverApi;
    }

    public static async backend_call<I, O>(name: string, params: I): Promise<O> {
        try {
            const res = await Backend.instance._serverApi.callPluginMethod<I, O>(name, params);
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
}

