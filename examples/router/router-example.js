class Signal {
    constructor(initialValue) {
        this.subscribers = new Set();
        this.isNotifying = false;
        this.value = initialValue;
    }
    get() {
        if (Computed.currentComputation) {
            Computed.currentComputation.addDependency(this);
        }
        return this.value;
    }
    set(newValue) {
        if (this.value !== newValue) {
            this.value = newValue;
            this.notify();
        }
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }
    notify() {
        if (this.isNotifying) {
            console.warn('Signal: Infinite rerender detected, skipping notification');
            return;
        }
        this.isNotifying = true;
        try {
            this.subscribers.forEach(callback => {
                try {
                    callback();
                }
                catch (error) {
                    console.error('Error in signal subscriber:', error);
                }
            });
        }
        finally {
            this.isNotifying = false;
        }
    }
}
class Computed {
    constructor(fn) {
        this.isDirty = true;
        this.dependencies = new Set();
        this.subscriptions = new Set();
        this.isComputing = false;
        this.subscribers = new Set();
        this.isNotifying = false;
        this.recomputeCount = 0;
        this.MAX_RECOMPUTES = 1000;
        this.lastRecomputeTime = Date.now();
        this.fn = fn;
    }
    get() {
        if (Computed.currentComputation && Computed.currentComputation !== this) {
            Computed.currentComputation.addDependency(this);
        }
        if (this.isDirty && !this.isComputing) {
            this.recompute();
        }
        return this.value;
    }
    recompute() {
        if (this.isComputing) {
            console.warn('Computed: Infinite computation detected, skipping recompute');
            return;
        }
        this.recomputeCount++;
        const now = Date.now();
        if (now - this.lastRecomputeTime > 100) {
            this.recomputeCount = 0;
            this.lastRecomputeTime = now;
        }
        if (this.recomputeCount > this.MAX_RECOMPUTES) {
            console.error('Computed: Maximum recompute limit exceeded, possible infinite loop');
            return;
        }
        this.isComputing = true;
        const previousComputation = Computed.currentComputation;
        Computed.currentComputation = this;
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions.clear();
        this.dependencies.clear();
        try {
            this.value = this.fn();
        }
        finally {
            Computed.currentComputation = previousComputation;
            this.isComputing = false;
        }
        this.isDirty = false;
        this.recomputeCount = 0;
    }
    markDirty() {
        if (!this.isDirty && !this.isComputing) {
            this.isDirty = true;
            this.notify();
        }
    }
    addDependency(dependency) {
        if (this.dependencies.has(dependency))
            return;
        this.dependencies.add(dependency);
        const unsubscribe = dependency.subscribe(() => {
            this.markDirty();
        });
        this.subscriptions.add(unsubscribe);
    }
    subscribe(callback) {
        if (this.isDirty) {
            this.get();
        }
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }
    notify() {
        if (this.isNotifying) {
            console.warn('Computed: Infinite rerender detected, skipping notification');
            return;
        }
        this.isNotifying = true;
        try {
            this.subscribers.forEach(callback => {
                try {
                    callback();
                }
                catch (error) {
                    console.error('Error in computed subscriber:', error);
                }
            });
        }
        finally {
            this.isNotifying = false;
        }
    }
}
Computed.currentComputation = null;
function signal(initialValue) {
    return new Signal(initialValue);
}
function computed(fn) {
    return new Computed(fn);
}

function classNames(...inputs) {
    const classes = [];
    for (const input of inputs) {
        if (!input)
            continue;
        if (typeof input === 'string') {
            classes.push(input);
        }
        else if (typeof input === 'number') {
            classes.push(String(input));
        }
        else if (typeof input === 'boolean') ;
        else if (Array.isArray(input)) {
            classes.push(classNames(...input));
        }
        else if (typeof input === 'object') {
            for (const key in input) {
                if (input[key]) {
                    classes.push(key);
                }
            }
        }
    }
    return classes.join(' ');
}
const reactiveValues = new WeakMap();
let globalUpdateCount = 0;
const MAX_GLOBAL_UPDATES = 10000;
let lastResetTime = Date.now();
function checkUpdateLimit() {
    globalUpdateCount++;
    const now = Date.now();
    if (now - lastResetTime > 100) {
        globalUpdateCount = 0;
        lastResetTime = now;
    }
    if (globalUpdateCount > MAX_GLOBAL_UPDATES) {
        console.error('ReactiveDOM: Maximum update limit exceeded, possible infinite loop detected');
        return false;
    }
    return true;
}
function hasValueChanged(element, key, newValue) {
    if (!reactiveValues.has(element)) {
        reactiveValues.set(element, new Map());
    }
    const elementValues = reactiveValues.get(element);
    const oldValue = elementValues.get(key);
    if (oldValue === newValue)
        return false;
    const hasChanged = !deepEqual(oldValue, newValue);
    if (hasChanged) {
        elementValues.set(key, newValue);
        return true;
    }
    return false;
}
function deepEqual(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null)
        return a === b;
    if (typeof a !== typeof b)
        return false;
    if (typeof a !== 'object')
        return a === b;
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    if (Array.isArray(a)) {
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i]))
                return false;
        }
        return true;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length)
        return false;
    for (const key of keysA) {
        if (!keysB.includes(key))
            return false;
        if (!deepEqual(a[key], b[key]))
            return false;
    }
    return true;
}
const reactiveNodes = new WeakMap();
function createElementFactory(tagName) {
    return (props, ...children) => {
        if (typeof props === 'string' ||
            typeof props === 'number' ||
            props instanceof HTMLElement ||
            props instanceof Signal ||
            props instanceof Computed) {
            children = [props, ...children];
            props = {};
        }
        props = props || {};
        const element = document.createElement(tagName);
        const subscriptions = [];
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'children') {
                if (Array.isArray(value)) {
                    children = [...children, ...value];
                }
                else {
                    children.push(value);
                }
            }
            else if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.toLowerCase().slice(2);
                element.addEventListener(eventName, value);
            }
            else {
                if (key === 'className') {
                    if (value instanceof Signal || value instanceof Computed) {
                        let isUpdating = false;
                        const updateClassName = () => {
                            if (isUpdating)
                                return;
                            if (!checkUpdateLimit())
                                return;
                            isUpdating = true;
                            try {
                                const classNameValue = value.get();
                                const finalClassName = typeof classNameValue === 'string' ||
                                    typeof classNameValue === 'number' ||
                                    typeof classNameValue === 'boolean' ||
                                    Array.isArray(classNameValue) ||
                                    (typeof classNameValue === 'object' &&
                                        classNameValue !== null)
                                    ? classNames(classNameValue)
                                    : String(classNameValue);
                                if (hasValueChanged(element, 'className', finalClassName)) {
                                    element.className = finalClassName;
                                }
                            }
                            catch (error) {
                                console.error('Error updating className:', error);
                            }
                            finally {
                                isUpdating = false;
                            }
                        };
                        try {
                            const classNameValue = value.get();
                            const finalClassName = typeof classNameValue === 'string' ||
                                typeof classNameValue === 'number' ||
                                typeof classNameValue === 'boolean' ||
                                Array.isArray(classNameValue) ||
                                (typeof classNameValue === 'object' && classNameValue !== null)
                                ? classNames(classNameValue)
                                : String(classNameValue);
                            element.className = finalClassName;
                        }
                        catch (error) {
                            console.error('Error setting initial className:', error);
                        }
                        const unsubscribe = value.subscribe(updateClassName);
                        subscriptions.push({ signal: value, unsubscribe });
                    }
                    else if (typeof value === 'string' ||
                        typeof value === 'number' ||
                        typeof value === 'boolean' ||
                        Array.isArray(value) ||
                        (typeof value === 'object' && value !== null)) {
                        element.className = classNames(value);
                    }
                    else {
                        element.className = String(value);
                    }
                }
                else {
                    if (value instanceof Signal || value instanceof Computed) {
                        let isUpdating = false;
                        const updateAttribute = () => {
                            if (isUpdating)
                                return;
                            if (!checkUpdateLimit())
                                return;
                            isUpdating = true;
                            try {
                                if (key === 'value' && element instanceof HTMLInputElement) {
                                    const inputValue = String(value.get());
                                    if (hasValueChanged(element, key, inputValue)) {
                                        element.value = inputValue;
                                    }
                                }
                                else {
                                    const attrValue = value.get();
                                    if (key === 'disabled' ||
                                        key === 'checked' ||
                                        key === 'readonly' ||
                                        key === 'required') {
                                        const newDisabled = Boolean(attrValue);
                                        if (hasValueChanged(element, key, newDisabled)) {
                                            if (newDisabled) {
                                                element.setAttribute(key, '');
                                            }
                                            else {
                                                element.removeAttribute(key);
                                            }
                                        }
                                    }
                                    else {
                                        const stringValue = String(attrValue);
                                        if (hasValueChanged(element, key, stringValue)) {
                                            element.setAttribute(key, stringValue);
                                        }
                                    }
                                }
                            }
                            catch (error) {
                                console.error('Error updating attribute:', key, error);
                            }
                            finally {
                                isUpdating = false;
                            }
                        };
                        try {
                            const initialValue = value.get();
                            if (key === 'value' && element instanceof HTMLInputElement) {
                                element.value = String(initialValue);
                            }
                            else if (key === 'disabled' ||
                                key === 'checked' ||
                                key === 'readonly' ||
                                key === 'required') {
                                if (initialValue) {
                                    element.setAttribute(key, '');
                                }
                                else {
                                    element.removeAttribute(key);
                                }
                            }
                            else {
                                element.setAttribute(key, String(initialValue));
                            }
                        }
                        catch (error) {
                            console.error('Error setting initial attribute value:', key, error);
                        }
                        const unsubscribe = value.subscribe(updateAttribute);
                        subscriptions.push({
                            signal: value,
                            unsubscribe,
                        });
                    }
                    else {
                        if (key === 'value' && element instanceof HTMLInputElement) {
                            element.value = String(value);
                        }
                        else {
                            if (key === 'disabled' ||
                                key === 'checked' ||
                                key === 'readonly' ||
                                key === 'required') {
                                if (value) {
                                    element.setAttribute(key, '');
                                }
                                else {
                                    element.removeAttribute(key);
                                }
                            }
                            else {
                                element.setAttribute(key, value);
                            }
                        }
                    }
                }
            }
        });
        children.forEach(child => {
            if (child instanceof Signal || child instanceof Computed) {
                const textNode = document.createTextNode('');
                element.appendChild(textNode);
                let isUpdating = false;
                const updateText = () => {
                    if (isUpdating)
                        return;
                    if (!checkUpdateLimit())
                        return;
                    isUpdating = true;
                    try {
                        if (textNode.parentNode) {
                            const textValue = String(child.get());
                            if (hasValueChanged(textNode, 'textContent', textValue)) {
                                textNode.textContent = textValue;
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error updating text node:', error);
                        textNode.textContent = '[Error]';
                    }
                    finally {
                        isUpdating = false;
                    }
                };
                try {
                    const textValue = String(child.get());
                    textNode.textContent = textValue;
                }
                catch (error) {
                    console.error('Error setting initial text:', error);
                    textNode.textContent = '[Error]';
                }
                const unsubscribe = child.subscribe(updateText);
                subscriptions.push({
                    signal: child,
                    unsubscribe,
                });
            }
            else if (typeof child === 'string' || typeof child === 'number') {
                element.appendChild(document.createTextNode(String(child)));
            }
            else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        if (subscriptions.length > 0) {
            reactiveNodes.set(element, subscriptions);
        }
        return element;
    };
}
const div = createElementFactory('div');
const h1 = createElementFactory('h1');
const h2 = createElementFactory('h2');
const h3 = createElementFactory('h3');
const p = createElementFactory('p');
const span = createElementFactory('span');
const a = createElementFactory('a');
const button = createElementFactory('button');
const nav = createElementFactory('nav');
const header = createElementFactory('header');
const footer = createElementFactory('footer');
const main = createElementFactory('main');

class Router {
    constructor(config) {
        this.routes = config.routes;
        this.basePath = config.basePath || '';
        this.defaultRoute = config.defaultRoute || '/';
        this.notFoundComponent = config.notFoundComponent;
        this.state = signal({
            currentPath: '',
            params: {},
            search: {},
            data: null,
            error: null,
            isLoading: false,
        });
        this.currentRoute = signal(null);
        this.historyStack = signal([]);
        this.currentIndex = signal(-1);
        this.initialize();
    }
    initialize() {
        window.addEventListener('popstate', _event => {
            const path = this.getPathFromUrl();
            this.navigateToPath(path, false);
        });
        const initialPath = this.getPathFromUrl() || this.defaultRoute;
        this.navigateToPath(initialPath, false);
    }
    getPathFromUrl() {
        const path = window.location.pathname;
        return path.startsWith(this.basePath)
            ? path.slice(this.basePath.length) || '/'
            : path;
    }
    updateUrl(path, replace = false) {
        const fullPath = this.basePath + path;
        if (replace) {
            window.history.replaceState(null, '', fullPath);
        }
        else {
            window.history.pushState(null, '', fullPath);
        }
    }
    parseParams(path, routePath) {
        const params = {};
        const pathSegments = path.split('/').filter(Boolean);
        const routeSegments = routePath.split('/').filter(Boolean);
        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const pathSegment = pathSegments[i];
            if (routeSegment.startsWith(':')) {
                const paramName = routeSegment.slice(1);
                params[paramName] = pathSegment || '';
            }
        }
        return params;
    }
    parseSearch() {
        const search = {};
        const urlSearch = window.location.search;
        if (urlSearch) {
            const searchParams = new URLSearchParams(urlSearch);
            for (const [key, value] of searchParams.entries()) {
                search[key] = value;
            }
        }
        return search;
    }
    findRoute(path) {
        return (this.routes.find(route => {
            const routePathSegments = route.path.split('/').filter(Boolean);
            const pathSegments = path.split('/').filter(Boolean);
            if (routePathSegments.length !== pathSegments.length) {
                return false;
            }
            return routePathSegments.every((segment, index) => {
                return segment.startsWith(':') || segment === pathSegments[index];
            });
        }) || null);
    }
    async navigateToPath(path, updateHistory = true) {
        const route = this.findRoute(path);
        const search = this.parseSearch();
        const params = route ? this.parseParams(path, route.path) : {};
        this.state.set({
            ...this.state.get(),
            currentPath: path,
            params,
            search,
            isLoading: true,
            error: null,
        });
        this.currentRoute.set(route);
        if (updateHistory) {
            const stack = this.historyStack.get();
            const currentIndex = this.currentIndex.get();
            const newStack = stack.slice(0, currentIndex + 1);
            newStack.push(path);
            this.historyStack.set(newStack);
            this.currentIndex.set(newStack.length - 1);
            this.updateUrl(path, false);
        }
        try {
            let data = null;
            if (route?.loader) {
                data = await route.loader(params, search);
            }
            this.state.set({
                ...this.state.get(),
                data,
                isLoading: false,
                error: null,
            });
        }
        catch (error) {
            this.state.set({
                ...this.state.get(),
                isLoading: false,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    async navigate(path) {
        await this.navigateToPath(path, true);
    }
    back() {
        const stack = this.historyStack.get();
        const currentIndex = this.currentIndex.get();
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const path = stack[newIndex];
            this.currentIndex.set(newIndex);
            this.navigateToPath(path, false);
        }
    }
    forward() {
        const stack = this.historyStack.get();
        const currentIndex = this.currentIndex.get();
        if (currentIndex < stack.length - 1) {
            const newIndex = currentIndex + 1;
            const path = stack[newIndex];
            this.currentIndex.set(newIndex);
            this.navigateToPath(path, false);
        }
    }
    canGoBack() {
        return this.currentIndex.get() > 0;
    }
    canGoForward() {
        const stack = this.historyStack.get();
        const currentIndex = this.currentIndex.get();
        return currentIndex < stack.length - 1;
    }
    getCurrentRoute() {
        return this.currentRoute.get();
    }
    getState() {
        return this.state.get();
    }
    Link(props) {
        const { to, className, children, ...otherProps } = props;
        return a({
            href: this.basePath + to,
            className,
            onClick: (e) => {
                e.preventDefault();
                this.navigate(to);
            },
            ...otherProps,
        }, children);
    }
    View() {
        const state = this.state.get();
        const route = this.currentRoute.get();
        if (state.isLoading) {
            return div({ className: 'router-loading' }, 'Loading...');
        }
        if (state.error && route?.errorBoundary) {
            return route.errorBoundary(state.error);
        }
        if (state.error) {
            return div({ className: 'router-error' }, 'Error: ', state.error.message);
        }
        if (route) {
            return route.component();
        }
        if (this.notFoundComponent) {
            return this.notFoundComponent();
        }
        return div({ className: 'router-not-found' }, 'Page not found');
    }
}
function createRouter(config) {
    return new Router(config);
}
function Link(router, props) {
    return router.Link(props);
}
function View(router) {
    return router.View();
}

const mockApi = {
    async getUsers() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            { id: 1, name: 'Alice', email: 'alice@example.com' },
            { id: 2, name: 'Bob', email: 'bob@example.com' },
            { id: 3, name: 'Charlie', email: 'charlie@example.com' },
        ];
    },
    async getUser(id) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const users = await this.getUsers();
        const user = users.find(u => u.id === parseInt(id));
        if (!user)
            throw new Error(`User ${id} not found`);
        return user;
    },
    async getPosts() {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return [
            {
                id: 1,
                title: 'First Post',
                author: 'Alice',
                content: 'This is the first post...',
            },
            {
                id: 2,
                title: 'Second Post',
                author: 'Bob',
                content: 'This is the second post...',
            },
            {
                id: 3,
                title: 'Third Post',
                author: 'Charlie',
                content: 'This is the third post...',
            },
        ];
    },
    async getPost(id) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const posts = await this.getPosts();
        const post = posts.find(p => p.id === parseInt(id));
        if (!post)
            throw new Error(`Post ${id} not found`);
        return post;
    },
};
const navigationState = signal({
    canGoBack: false,
    canGoForward: false,
});
const HomePage = () => {
    return div({ className: 'page home-page' }, h1({}, 'Welcome to Reactive Router Demo'), p({}, 'This example demonstrates the router with loaders and browser navigation.'), div({ className: 'feature-list' }, h3({}, 'Features:'), div({ className: 'feature-item' }, span({ className: 'feature-icon' }, '🔄'), span({}, 'Route loaders for data fetching')), div({ className: 'feature-item' }, span({ className: 'feature-icon' }, '⬅️➡️'), span({}, 'Browser back/forward navigation')), div({ className: 'feature-item' }, span({ className: 'feature-icon' }, '🔗'), span({}, 'URL parameters and search params')), div({ className: 'feature-item' }, span({ className: 'feature-icon' }, '⚠️'), span({}, 'Error boundaries')), div({ className: 'feature-item' }, span({ className: 'feature-icon' }, '⏳'), span({}, 'Loading states'))), div({ className: 'navigation-demo' }, h3({}, 'Try these routes:'), div({ className: 'route-links' }, Link(router, {
        to: '/users',
        className: 'route-link',
        children: '👥 Users',
    }), Link(router, {
        to: '/posts',
        className: 'route-link',
        children: '📝 Posts',
    }), Link(router, {
        to: '/users/1',
        className: 'route-link',
        children: '👤 User 1',
    }), Link(router, {
        to: '/posts/2',
        className: 'route-link',
        children: '📄 Post 2',
    }), Link(router, {
        to: '/search?q=test',
        className: 'route-link',
        children: '🔍 Search',
    }))));
};
const UsersPage = () => {
    const state = router.getState();
    const users = state.data;
    return div({ className: 'page users-page' }, h1({}, 'Users'), p({}, 'This page demonstrates a loader that fetches data.'), div({ className: 'users-list' }, ...users.map((user) => div({ key: user.id, className: 'user-item' }, h3({}, user.name), p({}, user.email), Link(router, {
        to: `/users/${user.id}`,
        className: 'user-link',
        children: 'View Details',
    })))));
};
const UserDetailPage = () => {
    const state = router.getState();
    const user = state.data;
    const { id } = state.params;
    return div({ className: 'page user-detail-page' }, h1({}, `User: ${user.name}`), p({}, `ID: ${id}`), p({}, `Email: ${user.email}`), div({ className: 'user-actions' }, Link(router, {
        to: '/users',
        className: 'back-link',
        children: '← Back to Users',
    }), Link(router, {
        to: '/posts',
        className: 'nav-link',
        children: 'View Posts',
    })));
};
const PostsPage = () => {
    const state = router.getState();
    const posts = state.data;
    return div({ className: 'page posts-page' }, h1({}, 'Posts'), p({}, 'This page demonstrates a loader that fetches posts data.'), div({ className: 'posts-list' }, ...posts.map((post) => div({ key: post.id, className: 'post-item' }, h3({}, post.title), p({}, `By: ${post.author}`), p({}, post.content), Link(router, {
        to: `/posts/${post.id}`,
        className: 'post-link',
        children: 'Read More',
    })))));
};
const PostDetailPage = () => {
    const state = router.getState();
    const post = state.data;
    const { id } = state.params;
    return div({ className: 'page post-detail-page' }, h1({}, post.title), p({}, `ID: ${id}`), p({}, `Author: ${post.author}`), div({ className: 'post-content' }, p({}, post.content)), div({ className: 'post-actions' }, Link(router, {
        to: '/posts',
        className: 'back-link',
        children: '← Back to Posts',
    }), Link(router, {
        to: '/users',
        className: 'nav-link',
        children: 'View Users',
    })));
};
const SearchPage = () => {
    const state = router.getState();
    const { q } = state.search;
    return div({ className: 'page search-page' }, h1({}, 'Search Results'), p({}, `Searching for: "${q}"`), div({ className: 'search-results' }, p({}, 'This demonstrates URL search parameters.'), p({}, 'Try changing the URL to see different search terms.'), p({}, 'Example: /search?q=react&filter=recent')), div({ className: 'search-actions' }, Link(router, {
        to: '/',
        className: 'back-link',
        children: '← Back to Home',
    }), Link(router, {
        to: '/search?q=test',
        className: 'nav-link',
        children: 'Search for "test"',
    }), Link(router, {
        to: '/search?q=router',
        className: 'nav-link',
        children: 'Search for "router"',
    })));
};
const ErrorBoundary = (error) => {
    return div({ className: 'error-boundary' }, h2({}, 'Something went wrong'), p({}, error.message), div({ className: 'error-actions' }, Link(router, { to: '/', className: 'error-link', children: 'Go Home' }), button({
        className: 'retry-button',
        onClick: () => window.location.reload(),
    }, 'Retry')));
};
const NotFoundPage = () => {
    return div({ className: 'page not-found-page' }, h1({}, '404 - Page Not Found'), p({}, 'The page you are looking for does not exist.'), Link(router, { to: '/', className: 'home-link', children: 'Go Home' }));
};
const Navigation = () => {
    return nav({ className: 'main-navigation' }, div({ className: 'nav-links' }, Link(router, { to: '/', className: 'nav-link', children: '🏠 Home' }), Link(router, {
        to: '/users',
        className: 'nav-link',
        children: '👥 Users',
    }), Link(router, {
        to: '/posts',
        className: 'nav-link',
        children: '📝 Posts',
    }), Link(router, {
        to: '/search?q=demo',
        className: 'nav-link',
        children: '🔍 Search',
    })), div({ className: 'browser-nav' }, button({
        className: 'nav-button',
        disabled: !navigationState.get().canGoBack,
        onClick: () => router.back(),
    }, '⬅️ Back'), button({
        className: 'nav-button',
        disabled: !navigationState.get().canGoForward,
        onClick: () => router.forward(),
    }, 'Forward ➡️')));
};
const router = createRouter({
    routes: [
        {
            path: '/',
            component: HomePage,
        },
        {
            path: '/users',
            component: UsersPage,
            loader: async () => {
                return await mockApi.getUsers();
            },
            errorBoundary: ErrorBoundary,
        },
        {
            path: '/users/:id',
            component: UserDetailPage,
            loader: async (params) => {
                return await mockApi.getUser(params.id);
            },
            errorBoundary: ErrorBoundary,
        },
        {
            path: '/posts',
            component: PostsPage,
            loader: async () => {
                return await mockApi.getPosts();
            },
            errorBoundary: ErrorBoundary,
        },
        {
            path: '/posts/:id',
            component: PostDetailPage,
            loader: async (params) => {
                return await mockApi.getPost(params.id);
            },
            errorBoundary: ErrorBoundary,
        },
        {
            path: '/search',
            component: SearchPage,
        },
    ],
    notFoundComponent: NotFoundPage,
});
router.state.subscribe(() => {
    navigationState.set({
        canGoBack: router.canGoBack(),
        canGoForward: router.canGoForward(),
    });
});
const RouterApp = () => {
    return div({ className: 'router-app' }, header({ className: 'app-header' }, h1({ className: 'app-title' }, 'Reactive Router Demo'), Navigation()), main({ className: 'app-main' }, View(router)), footer({ className: 'app-footer' }, p({}, 'Reactive Router with Loaders and Browser Navigation'), p({}, 'Current path: ', computed(() => router.getState().currentPath))));
};

export { RouterApp as default };
