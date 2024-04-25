export enum Action {
    REMOVE,
    CREATED,
    MODIFIED
}

export class Storage {

    private constructor() {
    }

    private static subscribers: { key: string, id: number; callback: (action: Action, newValue: string | null) => void }[] = [];

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
        const prevVal = this.getSessionStorageItem(key);
        const prefixedKey = Storage.SESSION_STORAGE_PREFIX + key;
        sessionStorage.setItem(prefixedKey, value);
        Storage.sessionStorageVariablesSet.add(prefixedKey);

        let action = null;
        if (prevVal == null) {
            action = Action.CREATED;
        } else if (prevVal != value) {
            action = Action.MODIFIED;
        }
        if (action != null) {
            Storage.invokeSubscribers(key, action);
        }
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
        Storage.invokeSubscribers(key, Action.REMOVE);
    }

    /**
     * Clears all session storage items.
     */
    public static clearAllSessionStorage(): void {
        for (const key of Storage.sessionStorageVariablesSet) {
            sessionStorage.removeItem(key);
            Storage.invokeSubscribers(key, Action.REMOVE);
        }
        Storage.sessionStorageVariablesSet.clear();
        Storage.subscribers = []
    }

    public static subscribe(key: string, callback: (action: Action, newValue: string | null) => void) {
        const id = new Date().getTime();
        Storage.subscribers.push({ key, id, callback });

        return id;
    };

    public static unsubscribe = (id: number) => {
        const index = Storage.subscribers.findIndex((f) => f.id === id);
        if (index > -1) {
            Storage.subscribers.splice(index, 1);
        }
    };

    private static invokeSubscribers(key: string, action: Action) {
        Storage.subscribers.forEach((e) => { if (e.key == key) { e.callback(action, Storage.getSessionStorageItem(key)) } });
    }
}
