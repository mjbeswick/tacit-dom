export declare function t(key: string, defaultMessage?: string, params?: Record<string, any>): import("./signals").ReadonlySignal<string>;
export declare function n(key: string, count: number, defaultMessage?: string, params?: Record<string, any>): import("./signals").ReadonlySignal<string>;
export declare function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): import("./signals").ReadonlySignal<string>;
export declare function formatNumber(value: number, options?: Intl.NumberFormatOptions): import("./signals").ReadonlySignal<string>;
export declare function useLocale(): {
    locale: import("./signals").Signal<string>;
    setLocale: (locale: string) => void;
    availableLocales: string[];
};
export declare function tWithContext(key: string, context: string, defaultMessage?: string, params?: Record<string, any>): import("./signals").ReadonlySignal<string>;
export declare function useNamespace(namespace: string): {
    t: (key: string, defaultMessage?: string, params?: Record<string, any>) => import("./signals").ReadonlySignal<string>;
    n: (key: string, count: number, defaultMessage?: string, params?: Record<string, any>) => import("./signals").ReadonlySignal<string>;
};
