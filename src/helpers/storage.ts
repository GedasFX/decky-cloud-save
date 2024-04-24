export class Storage {

    private constructor() {
    }

    /**
     * Prefix for session storage keys.
     */
    private static SESSION_STORAGE_PREFIX = 'dcs_';

    /**
     * Set to keep track of session storage variables.
     */
    private static sessionStorageVariablesSet: Set<string> = new Set<string>();

    /**
     * Sets a session storage item.
     * @param key - The key for the item.
     * @param value - The value to set.
     */
    public static setSessionStorageItem(key: string, value: string): void {
        const prefixedKey = Storage.SESSION_STORAGE_PREFIX + key;
        sessionStorage.setItem(prefixedKey, value);
        Storage.sessionStorageVariablesSet.add(prefixedKey);
    }

    /**
     * Gets a session storage item.
     * @param key - The key for the item.
     * @returns The value of the item, or null if not found.
     */
    public static getSessionStorageItem(key: string): string | null {
        const prefixedKey = Storage.SESSION_STORAGE_PREFIX + key;
        const item = sessionStorage.getItem(prefixedKey);
        return item ? item : null;
    }

    /**
     * Gets a session storage item.
     * @param key - The key for the item.
     * @param defValue - Default value
     * @returns The value of the item, or null if not found.
     */
    public static getSessionStorageItemOrDefault(key: string, defValue: string): string | null {
        const item = Storage.getSessionStorageItem(key);
        return item ? item : defValue;
    }

    /**
     * Removes a session storage item.
     * @param key - The key for the item.
     */
    public static removeSessionStorageItem(key: string): void {
        const prefixedKey = Storage.SESSION_STORAGE_PREFIX + key;
        sessionStorage.removeItem(prefixedKey);
        Storage.sessionStorageVariablesSet.delete(prefixedKey);
    }

    /**
     * Clears all session storage items.
     */
    public static clearAllSessionStorage(): void {
        for (const key of Storage.sessionStorageVariablesSet) {
            sessionStorage.removeItem(key);
        }
        Storage.sessionStorageVariablesSet.clear();
    }
}
