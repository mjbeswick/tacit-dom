export type Signal<T> = {
    get(): T;
    set(value: T): void;
    update(fn: (prev: T) => T | Promise<T>): Promise<void>;
    subscribe(fn: () => void): () => void;
    readonly pending: boolean;
    readonly value: T;
};
export type ReadonlySignal<T> = {
    get(): T;
    subscribe(fn: () => void): () => void;
    readonly value: T;
};
export declare function signal<T>(initialValue: T): Signal<T>;
export declare function computed<T>(computeFn: () => T): ReadonlySignal<T>;
export declare function effect(fn: () => void | (() => void)): () => void;
export declare function batch(fn: () => void): void;
