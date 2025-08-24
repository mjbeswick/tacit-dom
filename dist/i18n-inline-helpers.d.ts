/**
 * Helper functions for inline internationalization that work with the global inline i18n instance.
 * These functions provide convenient access to simple token-based translation and formatting
 * without needing to manually manage inline i18n instances.
 *
 * @example
 * ```typescript
 * import { t, n, formatDate, formatNumber, useLocale } from 'tacit-dom';
 *
 * // Use inline translation helpers
 * const welcome = t('welcome', 'Welcome {name}!', { name: 'John' });
 * const messageCount = n('messages', 5, '{count} messages', { count: 5 });
 *
 * // Format dates and numbers
 * const today = formatDate(new Date());
 * const price = formatNumber(1234.56);
 *
 * // Manage locale
 * const { locale, setLocale, availableLocales } = useLocale();
 * setLocale('de');
 * ```
 */

/**
 * Translates a key using the global inline i18n instance with simple token interpolation.
 *
 * @param key - Translation key to look up
 * @param defaultMessage - Default message with token placeholders (e.g., 'Hello {name}')
 * @param tokens - Optional tokens for interpolation
 * @returns A reactive signal containing the translated string
 *
 * @example
 * ```typescript
 * // Simple translation with tokens
 * const welcome = t('welcome', 'Welcome {name}!', { name: 'John' });
 * console.log(welcome.get()); // 'Welcome John!' or localized equivalent
 *
 * // With multiple tokens
 * const greeting = t('greeting', 'Hello {name}, you have {count} messages', {
 *   name: 'Jane',
 *   count: 5
 * });
 * console.log(greeting.get()); // 'Hello Jane, you have 5 messages' or localized equivalent
 *
 * // With currency formatting
 * const price = t('price', 'Price: ${price}', { price: 29.99 });
 * console.log(price.get()); // 'Price: $29.99' or localized equivalent
 *
 * // Nested key
 * const submitButton = t('buttons.submit', 'Submit {action}', { action: 'Form' });
 * console.log(submitButton.get()); // 'Submit Form' or localized equivalent
 *
 * // In components
 * const WelcomeMessage = (props: { name: string }) => {
 *   const message = t('welcome.message', 'Welcome to our app, {name}!', { name: props.name });
 *   return div(message);
 * };
 * ```
 */
export declare function t(key: string, defaultMessage: string, tokens?: Record<string, string | number>): import("./signals").ReadonlySignal<string>;

/**
 * Translates a key with pluralization support using the global inline i18n instance.
 *
 * @param key - Translation key to look up
 * @param count - Count for pluralization rules
 * @param defaultMessage - Default message with token placeholders
 * @param tokens - Optional tokens for interpolation
 * @returns A reactive signal containing the translated string
 *
 * @example
 * ```typescript
 * // Singular
 * const message1 = n('message', 1, '{count} message', { count: 1 });
 * console.log(message1.get()); // '1 message' or localized equivalent
 *
 * // Plural
 * const message5 = n('message', 5, '{count} messages', { count: 5 });
 * console.log(message5.get()); // '5 messages' or localized equivalent
 *
 * // With additional tokens
 * const userCount = n('user.count', 0, 'No users in {category}', { category: 'admin' });
 * console.log(userCount.get()); // 'No users in admin' or localized equivalent
 *
 * const userCount2 = n('user.count', 1, '{count} user in {category}', {
 *   count: 1,
 *   category: 'admin'
 * });
 * console.log(userCount2.get()); // '1 user in admin' or localized equivalent
 *
 * // In components
 * const UserCount = (props: { count: number; category: string }) => {
 *   const message = n('user.count', props.count, '{count} users in {category}', {
 *     count: props.count,
 *     category: props.category
 *   });
 *   return div(message);
 * };
 * ```
 */
export declare function n(key: string, count: number, defaultMessage: string, tokens?: Record<string, string | number>): import("./signals").ReadonlySignal<string>;

/**
 * Formats a date according to the current locale using the global inline i18n instance.
 *
 * @param date - Date to format
 * @param options - Optional formatting options to override locale defaults
 * @returns A reactive signal containing the formatted date string
 *
 * @example
 * ```typescript
 * // Format current date
 * const today = formatDate(new Date());
 * console.log(today.get()); // 'Monday, January 1, 2024' (en) or localized equivalent
 *
 * // With custom options
 * const shortDate = formatDate(new Date(), {
 *   dateStyle: 'short',
 *   timeStyle: 'short'
 * });
 * console.log(shortDate.get()); // '1/1/24, 12:00 PM' (en) or localized equivalent
 *
 * // Format specific date
 * const christmas = formatDate(new Date('2024-12-25'));
 * console.log(christmas.get()); // 'Wednesday, December 25, 2024' (en) or localized equivalent
 *
 * // In components
 * const DateDisplay = (props: { date: Date }) => {
 *   const formattedDate = formatDate(props.date);
 *   return div(formattedDate);
 * };
 * ```
 */
export declare function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): import("./signals").ReadonlySignal<string>;

/**
 * Formats a number according to the current locale using the global inline i18n instance.
 *
 * @param value - Number to format
 * @param options - Optional formatting options to override locale defaults
 * @returns A reactive signal containing the formatted number string
 *
 * @example
 * ```typescript
 * // Format currency
 * const price = formatNumber(1234.56);
 * console.log(price.get()); // '$1,234.56' (en-US) or localized equivalent
 *
 * // With custom options
 * const percentage = formatNumber(0.75, {
 *   style: 'percent',
 *   minimumFractionDigits: 1
 * });
 * console.log(percentage.get()); // '75.0%' (en) or localized equivalent
 *
 * // Format large numbers
 * const population = formatNumber(1234567);
 * console.log(population.get()); // '1,234,567' (en) or localized equivalent
 *
 * // In components
 * const PriceDisplay = (props: { amount: number }) => {
 *   const formattedPrice = formatNumber(props.amount, {
 *     style: 'currency',
 *     currency: 'USD'
 *   });
 *   return div(formattedPrice);
 * };
 * ```
 */
export declare function formatNumber(value: number, options?: Intl.NumberFormatOptions): import("./signals").ReadonlySignal<string>;

/**
 * Hook-like function that provides access to locale management functionality.
 * Returns reactive locale state and functions to manage it.
 *
 * @returns Object containing locale signal, setter function, and available locales
 *
 * @example
 * ```typescript
 * // Get locale management functions
 * const { locale, setLocale, availableLocales } = useLocale();
 *
 * // Subscribe to locale changes
 * locale.subscribe(() => {
 *   console.log('Locale changed to:', locale.get());
 * });
 *
 * // Change locale
 * setLocale('de');
 *
 * // Display available locales
 * console.log('Available locales:', availableLocales);
 *
 * // In components
 * const LocaleSelector = () => {
 *   const { locale, setLocale, availableLocales } = useLocale();
 *
 *   return select(
 *     { onChange: (e) => setLocale(e.target.value) },
 *     availableLocales.map(loc =>
 *       option({
 *         value: loc,
 *         selected: locale.get() === loc
 *       }, loc.toUpperCase())
 *     )
 *   );
 * };
 *
 * // Use in app
 * const app = div(
 *   header(LocaleSelector()),
 *   main(/* main content */)
 * );
 * ```
 */
export declare function useLocale(): {
    locale: import("./signals").Signal<string>;
    setLocale: (locale: string) => void;
    availableLocales: string[];
};

/**
 * Creates a namespaced inline translation helper that automatically prefixes keys with a namespace.
 * Useful for organizing translations by feature or module.
 *
 * @param namespace - Namespace to prefix all translation keys with
 * @returns Object containing namespaced inline translation functions
 *
 * @example
 * ```typescript
 * // Create namespaced helpers
 * const userTranslations = useNamespace('user');
 * const productTranslations = useNamespace('product');
 *
 * // Use namespaced translations
 * const userName = userTranslations.t('name', 'Name: {name}', { name: 'John' });
 * const userEmail = userTranslations.t('email', 'Email: {email}', { email: 'john@example.com' });
 *
 * const productTitle = productTranslations.t('title', 'Product: {title}', { title: 'Widget' });
 * const productPrice = productTranslations.t('price', 'Price: ${price}', { price: 29.99 });
 *
 * // With pluralization
 * const userCount = userTranslations.n('count', 5, '{count} users', { count: 5 });
 *
 * // In components
 * const UserProfile = () => {
 *   const t = useNamespace('user.profile');
 *
 *   return div(
 *     h1(t.t('title', 'User Profile: {name}', { name: 'John' })),
 *     p(t.t('description', 'Manage your profile information')),
 *     button(t.t('save', 'Save Changes'))
 *   );
 * };
 *
 * // Nested namespaces
 * const formTranslations = useNamespace('form.validation');
 * const requiredField = formTranslations.t('required', 'This field is required');
 * const emailFormat = formTranslations.t('email', 'Invalid email format');
 *
 * // Complex namespace example
 * const adminTranslations = useNamespace('admin.users');
 * const userList = adminTranslations.t('list.title', 'User Management');
 * const userCount = adminTranslations.n('list.count', 0, 'No users found');
 *
 * // With tokens in namespaced translations
 * const dashboardTranslations = useNamespace('dashboard');
 * const welcomeMessage = dashboardTranslations.t('welcome', 'Welcome back, {name}!', { name: 'Admin' });
 * const statsCount = dashboardTranslations.n('stats.users', 10, '{count} active users', { count: 10 });
 * ```
 */
export declare function useNamespace(namespace: string): {
    t: (key: string, defaultMessage: string, tokens?: Record<string, string | number>) => import("./signals").ReadonlySignal<string>;
    n: (key: string, count: number, defaultMessage: string, tokens?: Record<string, string | number>) => import("./signals").ReadonlySignal<string>;
};
