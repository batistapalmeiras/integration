type StorageKind = 'local' | 'session';

interface StoredValue<T> {
  load(): T | null;
  save(value: T): void;
  clear(): void;
}

const storageFor = (kind: StorageKind): Storage => (kind === 'local' ? window.localStorage : window.sessionStorage);

export function storedValue<T>(key: string, kind: StorageKind = 'local'): StoredValue<T> {
  return {
    load() {
      try {
        const raw = storageFor(kind).getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    save(value) {
      try {
        storageFor(kind).setItem(key, JSON.stringify(value));
      } catch {
        return;
      }
    },
    clear() {
      try {
        storageFor(kind).removeItem(key);
      } catch {
        return;
      }
    },
  };
}
