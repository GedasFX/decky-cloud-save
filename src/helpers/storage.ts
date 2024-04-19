const SESSION_STORAGE_PREFIX = 'dcs_';

let sessionStorageVariablesSet: Set<string> = new Set<string>();

export function setSessionStorageItem(key: string, value: string): void {
    const prefixedKey = SESSION_STORAGE_PREFIX + key;
    sessionStorage.setItem(prefixedKey, value);
    sessionStorageVariablesSet.add(prefixedKey);
}

export function getSessionStorageItem(key: string): string | null {
    const prefixedKey = SESSION_STORAGE_PREFIX + key;
    const item = sessionStorage.getItem(prefixedKey);
    return item ? item : null;
}

export function removeSessionStorageItem(key: string): void {
    const prefixedKey = SESSION_STORAGE_PREFIX + key;
    sessionStorage.removeItem(prefixedKey);
    sessionStorageVariablesSet.delete(prefixedKey);
}

export function clearAllSessionStorage(): void {
    for (const key of sessionStorageVariablesSet) {
        sessionStorage.removeItem(key);
    }
    sessionStorageVariablesSet.clear();
}
