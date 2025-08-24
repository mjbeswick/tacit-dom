import { type ReadonlySignal, type Signal } from './signals';

/**
 * Locale identifier string (e.g., 'en', 'en-US', 'de', 'fr').
 *
 * @example
 * ```typescript
 * const locales: Locale[] = ['en', 'en-US', 'de', 'fr', 'es'];
 * ```
 */
type Locale = string;

/**
 * Translation key used to look up localized text.
 *
 * @example
 * ```typescript
 * const keys: TranslationKey[] = ['welcome', 'goodbye', 'loading'];
 * ```
 */
type TranslationKey = string;

/**
 * Tokens for interpolation in translation strings.
 * Keys are token names, values are the actual values to substitute.
 *
 * @example
 * ```typescript
 * const tokens: TranslationTokens = {
 *   name: 'John',
 *   count: 5,
 *   price: 29.99
 * };
 * ```
 */
type TranslationTokens = Record<string, string | number>;

/**
 * Collection of translations for a specific locale.
 * In inline i18n, translations are simple string key-value pairs.
 *
 * @example
 * ```typescript
 * const enTranslations: Translations = {
 *   welcome: 'Welcome to our app',
 *   greeting: 'Hello {name}, you have {count} messages',
 *   price: 'Price: ${price}',
 *   items: '{count} items'
 * };
 * ```
 */
type Translations = Record<string, string>;

/**
 * Complete translation data organized by locale.
 *
 * @example
 * ```typescript
 * const localeData: LocaleData = {
 *   en: {
 *     welcome: 'Welcome',
 *     greeting: 'Hello {name}!'
 *   },
 *   de: {
 *     welcome: 'Willkommen',
 *     greeting: 'Hallo {name}!'
 *   },
 *   fr: {
 *     welcome: 'Bienvenue',
 *     greeting: 'Bonjour {name}!'
 *   }
 * };
 * ```
 */
type LocaleData = Record<Locale, Translations>;

/**
 * Configuration options for the inline i18n system.
 *
 * @example
 * ```typescript
 * const i18nConfig: I18nConfig = {
 *   defaultLocale: 'en',
 *   fallbackLocale: 'en',
 *   dateTimeFormats: {
 *     en: {
 *       dateStyle: 'full',
 *       timeStyle: 'short'
 *     },
 *     de: {
 *       dateStyle: 'long',
 *       timeStyle: 'medium'
 *     }
 *   },
 *   numberFormats: {
 *     en: {
 *       style: 'currency',
 *       currency: 'USD'
 *     },
 *     de: {
 *       style: 'currency',
 *       currency: 'EUR'
 *     }
 *   }
 * };
 * ```
 */
type I18nConfig = {
    /** Default locale to use when no locale is specified */
    defaultLocale: Locale;
    /** Fallback locale when a translation is missing */
    fallbackLocale?: Locale;
    /** Locale-specific date/time formatting options */
    dateTimeFormats?: Record<Locale, Intl.DateTimeFormatOptions>;
    /** Locale-specific number formatting options */
    numberFormats?: Record<Locale, Intl.NumberFormatOptions>;
};

/**
 * Inline internationalization class that handles simple string interpolation.
 * Unlike the full i18n system, this uses simple token replacement with {token} syntax.
 *
 * @example
 * ```typescript
 * // Create inline i18n instance
 * const i18n = new InlineI18n({
 *   en: {
 *     welcome: 'Welcome {name}!',
 *     items: 'You have {count} items',
 *     price: 'Price: ${price}'
 *   },
 *   de: {
 *     welcome: 'Willkommen {name}!',
 *     items: 'Sie haben {count} Artikel',
 *     price: 'Preis: {price}€'
 *   }
 * }, {
 *   defaultLocale: 'en',
 *   fallbackLocale: 'en'
 * });
 *
 * // Subscribe to locale changes
 * i18n.locale.subscribe(() => {
 *   console.log('Locale changed to:', i18n.locale.get());
 * });
 *
 * // Change locale
 * i18n.setLocale('de');
 *
 * // Get translated text with tokens
 * const welcome = i18n.t('welcome', 'Welcome {name}!', { name: 'John' });
 * console.log(welcome.get()); // 'Willkommen John!' (if locale is 'de')
 *
 * // With pluralization
 * const itemCount = i18n.n('items', 5, '{count} items', { count: 5 });
 * console.log(itemCount.get()); // 'Sie haben 5 Artikel' (if locale is 'de')
 *
 * // Format dates and numbers
 * const formattedDate = i18n.formatDate(new Date());
 * const formattedNumber = i18n.formatNumber(1234.56);
 * ```
 */
declare class InlineI18n {
    private config;
    private translations;
    private currentLocale;
    private fallbackLocale;

    /**
     * Creates a new inline i18n instance with translations and configuration.
     * @param translations - Translation data organized by locale
     * @param config - i18n configuration options
     */
    constructor(translations: LocaleData, config: I18nConfig);

    /** Reactive signal containing the current locale */
    get locale(): Signal<Locale>;

    /**
     * Changes the current locale and triggers updates for all translated content.
     * @param locale - The new locale to set
     *
     * @example
     * ```typescript
     * // Change to German
     * i18n.setLocale('de');
     *
     * // Change to French
     * i18n.setLocale('fr');
     *
     * // Change to US English
     * i18n.setLocale('en-US');
     * ```
     */
    setLocale(locale: Locale): void;

    /**
     * Gets a translated string for the given key with token interpolation.
     * @param key - Translation key to look up
     * @param defaultMessage - Default message if translation is missing (used for token extraction)
     * @param tokens - Optional tokens for interpolation
     * @returns A reactive signal containing the translated string
     *
     * @example
     * ```typescript
     * // Simple translation
     * const welcome = i18n.t('welcome', 'Welcome {name}!', { name: 'John' });
     * console.log(welcome.get()); // 'Welcome John!' or localized equivalent
     *
     * // With multiple tokens
     * const message = i18n.t('greeting', 'Hello {name}, you have {count} messages', {
     *   name: 'Jane',
     *   count: 5
     * });
     * console.log(message.get()); // 'Hello Jane, you have 5 messages' or localized equivalent
     *
     * // With currency formatting
     * const price = i18n.t('price', 'Price: ${price}', { price: 29.99 });
     * console.log(price.get()); // 'Price: $29.99' or localized equivalent
     *
     * // Nested key
     * const submitButton = i18n.t('buttons.submit', 'Submit {action}', { action: 'Form' });
     * console.log(submitButton.get()); // 'Submit Form' or localized equivalent
     * ```
     */
    t(key: TranslationKey, defaultMessage: string, tokens?: TranslationTokens): ReadonlySignal<string>;

    /**
     * Gets a translated string with pluralization support and token interpolation.
     * @param key - Translation key to look up
     * @param count - Count for pluralization rules
     * @param defaultMessage - Default message if translation is missing (used for token extraction)
     * @param tokens - Optional tokens for interpolation
     * @returns A reactive signal containing the translated string
     *
     * @example
     * ```typescript
     * // Singular
     * const message1 = i18n.n('message', 1, '{count} message', { count: 1 });
     * console.log(message1.get()); // '1 message' or localized equivalent
     *
     * // Plural
     * const message5 = i18n.n('message', 5, '{count} messages', { count: 5 });
     * console.log(message5.get()); // '5 messages' or localized equivalent
     *
     * // With additional tokens
     * const userCount = i18n.n('user.count', 0, 'No users in {category}', { category: 'admin' });
     * console.log(userCount.get()); // 'No users in admin' or localized equivalent
     *
     * const userCount2 = i18n.n('user.count', 1, '{count} user in {category}', {
     *   count: 1,
     *   category: 'admin'
     * });
     * console.log(userCount2.get()); // '1 user in admin' or localized equivalent
     * ```
     */
    n(key: TranslationKey, count: number, defaultMessage: string, tokens?: TranslationTokens): ReadonlySignal<string>;

    /**
     * Formats a date according to the current locale's date/time formatting rules.
     * @param date - Date to format
     * @param options - Optional formatting options to override locale defaults
     * @returns A reactive signal containing the formatted date string
     *
     * @example
     * ```typescript
     * // Format current date
     * const today = i18n.formatDate(new Date());
     * console.log(today.get()); // 'Monday, January 1, 2024' (en) or localized equivalent
     *
     * // With custom options
     * const shortDate = i18n.formatDate(new Date(), {
     *   dateStyle: 'short',
     *   timeStyle: 'short'
     * });
     * console.log(shortDate.get()); // '1/1/24, 12:00 PM' (en) or localized equivalent
     *
     * // Format specific date
     * const christmas = i18n.formatDate(new Date('2024-12-25'));
     * console.log(christmas.get()); // 'Wednesday, December 25, 2024' (en) or localized equivalent
     * ```
     */
    formatDate(date: Date, options?: Intl.DateTimeFormatOptions): ReadonlySignal<string>;

    /**
     * Formats a number according to the current locale's number formatting rules.
     * @param value - Number to format
     * @param options - Optional formatting options to override locale defaults
     * @returns A reactive signal containing the formatted number string
     *
     * @example
     * ```typescript
     * // Format currency
     * const price = i18n.formatNumber(1234.56);
     * console.log(price.get()); // '$1,234.56' (en-US) or localized equivalent
     *
     * // With custom options
     * const percentage = i18n.formatNumber(0.75, {
     *   style: 'percent',
     *   minimumFractionDigits: 1
     * });
     * console.log(percentage.get()); // '75.0%' (en) or localized equivalent
     *
     * // Format large numbers
     * const population = i18n.formatNumber(1234567);
     * console.log(population.get()); // '1,234,567' (en) or localized equivalent
     * ```
     */
    formatNumber(value: number, options?: Intl.NumberFormatOptions): ReadonlySignal<string>;

    private interpolate;

    /**
     * Gets all available locales that have translations.
     * @returns Array of locale strings
     *
     * @example
     * ```typescript
     * const availableLocales = i18n.getAvailableLocales();
     * console.log('Available locales:', availableLocales);
     * // Output: ['en', 'de', 'fr', 'es', 'it']
     *
     * // Use in locale selector
     * const localeSelector = select(
     *   availableLocales.map(locale =>
     *     option({ value: locale }, locale.toUpperCase())
     *   )
     * );
     * ```
     */
    getAvailableLocales(): Locale[];

    /**
     * Adds or updates translations for a specific locale.
     * @param locale - Locale to add translations for
     * @param translations - Translation data to add
     *
     * @example
     * ```typescript
     * // Add new locale
     * i18n.addTranslations('it', {
     *   welcome: 'Benvenuto {name}!',
     *   goodbye: 'Arrivederci {name}!',
     *   items: 'Hai {count} articoli'
     * });
     *
     * // Update existing locale
     * i18n.addTranslations('en', {
     *   newKey: 'New translation',
     *   existingKey: 'Updated translation'
     * });
     *
     * // Add nested translations
     * i18n.addTranslations('es', {
     *   errors: {
     *     validation: {
     *       required: 'Este campo es obligatorio',
     *       email: 'Formato de email inválido'
     *     }
     *   }
     * });
     * ```
     */
    addTranslations(locale: Locale, translations: Translations): void;

    /**
     * Exports all translations for a specific locale.
     * @param locale - Locale to export translations for
     * @returns Translation object or null if locale doesn't exist
     *
     * @example
     * ```typescript
     * // Export English translations
     * const enTranslations = i18n.exportTranslations('en');
     * if (enTranslations) {
     *   console.log('English translations:', enTranslations);
     *   // Save to file or send to server
     * }
     *
     * // Export all locales
     * const allTranslations: Record<string, Translations> = {};
     * i18n.getAvailableLocales().forEach(locale => {
     *   const translations = i18n.exportTranslations(locale);
     *   if (translations) {
     *     allTranslations[locale] = translations;
     *   }
     * });
     *
     * console.log('All translations:', allTranslations);
     * ```
     */
    exportTranslations(locale: Locale): Translations | null;
}

/**
 * Creates a new inline i18n instance with the specified translations and configuration.
 *
 * @param translations - Translation data organized by locale
 * @param config - i18n configuration options
 * @returns A new InlineI18n instance
 *
 * @example
 * ```typescript
 * // Create inline i18n with translations
 * const i18n = createInlineI18n({
 *   en: {
 *     welcome: 'Welcome {name}!',
 *     items: 'You have {count} items',
 *     price: 'Price: ${price}'
 *   },
 *   de: {
 *     welcome: 'Willkommen {name}!',
 *     items: 'Sie haben {count} Artikel',
 *     price: 'Preis: {price}€'
 *   }
 * }, {
 *   defaultLocale: 'en',
 *   fallbackLocale: 'en',
 *   dateTimeFormats: {
 *     en: { dateStyle: 'full' },
 *     de: { dateStyle: 'long' }
 *   }
 * });
 *
 * // Use the i18n instance
 * i18n.setLocale('de');
 * const welcome = i18n.t('welcome', 'Welcome {name}!', { name: 'John' });
 * console.log(welcome.get()); // 'Willkommen John!'
 * ```
 */
declare function createInlineI18n(translations: LocaleData, config: I18nConfig): InlineI18n;

/**
 * Sets the global inline i18n instance that can be accessed throughout the application.
 * @param i18n - The inline i18n instance to set as global
 *
 * @example
 * ```typescript
 * // Create and set global inline i18n
 * const i18n = createInlineI18n(translations, config);
 * setGlobalInlineI18n(i18n);
 *
 * // Now you can access it from anywhere
 * const globalI18n = getGlobalInlineI18n();
 * globalI18n.setLocale('fr');
 * ```
 */
declare function setGlobalInlineI18n(i18n: InlineI18n): void;

/**
 * Gets the global inline i18n instance.
 * @returns The global inline i18n instance or undefined if not set
 *
 * @example
 * ```typescript
 * // Get global inline i18n instance
 * const i18n = getGlobalInlineI18n();
 * if (i18n) {
 *   const welcome = i18n.t('welcome', 'Welcome {name}!', { name: 'John' });
 *   console.log(welcome.get());
 * } else {
 *   console.log('No global inline i18n instance found');
 * }
 *
 * // Use in components
 * function WelcomeComponent() {
 *   const i18n = getGlobalInlineI18n();
 *   if (!i18n) return div('i18n not initialized');
 *
 *   const welcome = i18n.t('welcome', 'Welcome {name}!', { name: 'John' });
 *   return div(welcome);
 * }
 * ```
 */
declare function getGlobalInlineI18n(): InlineI18n;

export { createInlineI18n, getGlobalInlineI18n, InlineI18n, setGlobalInlineI18n, type I18nConfig, type Locale, type LocaleData, type TranslationKey, type Translations, type TranslationTokens };
