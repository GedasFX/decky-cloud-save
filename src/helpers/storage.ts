export class Storage {
    private static SESSION_STORAGE_PREFIX = 'dcs_';

    private static sessionStorageVariablesSet: Set<string> = new Set<string>();

    public static setSessionStorageItem(key: string, value: string): void {
        const prefixedKey = Storage.SESSION_STORAGE_PREFIX + key;
        sessionStorage.setItem(prefixedKey, value);
        Storage.sessionStorageVariablesSet.add(prefixedKey);
    }

    public static getSessionStorageItem(key: string): string | null {
        const prefixedKey = Storage.SESSION_STORAGE_PREFIX + key;
        const item = sessionStorage.getItem(prefixedKey);
        return item ? item : null;
    }

    public static removeSessionStorageItem(key: string): void {
        const prefixedKey = Storage.SESSION_STORAGE_PREFIX + key;
        sessionStorage.removeItem(prefixedKey);
        Storage.sessionStorageVariablesSet.delete(prefixedKey);
    }

    public static clearAllSessionStorage(): void {
        for (const key of Storage.sessionStorageVariablesSet) {
            sessionStorage.removeItem(key);
        }
        Storage.sessionStorageVariablesSet.clear();
    }
}