import type { Signal } from './signals';
export type RouteParams = Record<string, string>;
export type RouteSearch = Record<string, string>;
export type Route = {
    path: string;
    component: (data?: any) => HTMLElement;
    loader?: (_params: RouteParams, _search: RouteSearch) => Promise<any> | any;
    errorBoundary?: (_error: Error) => HTMLElement;
};
export type RouterState = {
    currentPath: string;
    params: RouteParams;
    search: RouteSearch;
    data: any;
    error: Error | null;
    isLoading: boolean;
};
export type RouterConfig = {
    routes: Route[];
    basePath?: string;
    defaultRoute?: string;
    notFoundComponent?: () => HTMLElement;
};
export declare class Router {
    private routes;
    private basePath;
    private defaultRoute;
    private notFoundComponent;
    state: Signal<RouterState>;
    private currentRoute;
    private historyStack;
    private currentIndex;
    constructor(config: RouterConfig);
    private initialize;
    private getPathFromUrl;
    private updateUrl;
    private parseParams;
    private parseSearch;
    private findRoute;
    private navigateToPath;
    navigate(path: string): Promise<void>;
    back(): void;
    forward(): void;
    canGoBack(): boolean;
    canGoForward(): boolean;
    getCurrentRoute(): Route | null;
    getState(): RouterState;
    link(props: {
        to: string;
        className?: string;
        children: any;
        [key: string]: any;
    }): HTMLElement;
    View(): HTMLElement;
}
export declare const history: {
    back: () => void;
    forward: () => void;
    canGoBack: () => boolean;
    canGoForward: () => boolean;
};
export declare function link(props: {
    to: string;
    className?: string;
    children: any;
    [key: string]: any;
}): HTMLElement;
export declare function createRouter(config: RouterConfig): Router;
export declare function router(props: {
    routes: Route[];
    basePath?: string;
    defaultRoute?: string;
    notFoundComponent?: () => HTMLElement;
}): HTMLElement;
