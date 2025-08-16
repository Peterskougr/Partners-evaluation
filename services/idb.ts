
const DB_NAME = 'wo-eval-db';
const STORE = 'handles';
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function idbGet<T>(key: IDBValidKey): Promise<T | undefined> {
    return openDb().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const store = tx.objectStore(STORE);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
    }));
}

export function idbSet(key: IDBValidKey, value: any): Promise<void> {
    return openDb().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    }));
}

export function idbDel(key: IDBValidKey): Promise<void> {
    return openDb().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    }));
}
