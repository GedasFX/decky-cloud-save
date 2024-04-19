import { ServerAPI } from "decky-frontend-lib";

let _serverApi: ServerAPI = null!;

export function initialize(serverApi: ServerAPI) {
    _serverApi = serverApi;
}

export async function backend_call<I, O>(name: string, params: I): Promise<O> {
    try {
        const res = await _serverApi.callPluginMethod<I, O>(name, params);
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