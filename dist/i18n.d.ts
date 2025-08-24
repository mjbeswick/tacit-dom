import { type ReadonlySignal, type Signal } from './signals';
type Locale = string;
type TranslationKey = string;
type TranslationValue = string | ((params: Record<string, any>) => string) | Record<string, any>;
type Translations = Record<string, any>;
type LocaleData = Record<Locale, Translations>;
type I18nConfig = {
    defaultLocale: Locale;
    fallbackLocale?: Locale;
    dateTimeFormats?: Record<Locale, Intl.DateTimeFormatOptions>;
    numberFormats?: Record<Locale, Intl.NumberFormatOptions>;
};
declare class I18n {
    private config;
    private translations;
    private currentLocale;
    private fallbackLocale;
    constructor(translations: LocaleData, config: I18nConfig);
    get locale(): Signal<Locale>;
    setLocale(locale: Locale): void;
    t(key: TranslationKey, defaultMessage?: string, params?: Record<string, any>): ReadonlySignal<string>;
    private getNestedTranslation;
    private interpolate;
    n(key: TranslationKey, count: number, defaultMessage?: string, params?: Record<string, any>): ReadonlySignal<string>;
    formatDate(date: Date, options?: Intl.DateTimeFormatOptions): ReadonlySignal<string>;
    formatNumber(value: number, options?: Intl.NumberFormatOptions): ReadonlySignal<string>;
    addTranslations(locale: Locale, translations: Translations): void;
    getAvailableLocales(): Locale[];
    exportTranslations(locale: Locale): Translations | null;
}
declare function createI18n(translations: LocaleData, config: I18nConfig): I18n;
declare function setGlobalI18n(i18n: I18n): void;
declare function getGlobalI18n(): I18n;
export { createI18n, getGlobalI18n, I18n, setGlobalI18n, type I18nConfig, type Locale, type LocaleData, type TranslationKey, type Translations, type TranslationValue, };
