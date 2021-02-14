import { Cache } from 'memory-cache';


export function computeIfAbsent<K, R>(fn: (key: K) => Promise<R>, ttlMillis: number = 0): (key: K) => Promise<R> {
    const memory = new Cache<K, Promise<R>>();

    return (key) => {
        const computed = memory.get(key);

        if (computed != null) {
            return computed;
        }

        const computation = fn(key);

        memory.put(key, computation, ttlMillis);

        computation.catch(() => {
            if (memory.get(key) === computation) {
                memory.del(key);
            }
        })

        return computation;
    }
}
