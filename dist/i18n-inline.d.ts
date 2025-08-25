import { type ReadonlySignal, type Signal } from './signals';
type Locale = string;
type TranslationKey = string;
type TranslationTokens = Record<string, string | number>;
type Translations = Record<string, string>;
type LocaleData = Record<Locale, Translations>;
type I18nConfig = {
    defaultLocale: Locale;
    fallbackLocale?: Locale;
    dateTimeFormats?: Record<Locale, Intl.DateTimeFormatOptions>;
    numberFormats?: Record<Locale, Intl.NumberFormatOptions>;
};
declare class InlineI18n {
    private config;
    private translations;
    private currentLocale;
    private fallbackLocale;
    constructor(translations: LocaleData, config: I18nConfig);
    get locale(): Signal<Locale>;
    setLocale(locale: Locale): void;
    t(key: TranslationKey, defaultMessage: string, tokens?: TranslationTokens): ReadonlySignal<string>;
    n(key: TranslationKey, count: number, defaultMessage: string, tokens?: TranslationTokens): ReadonlySignal<string>;
    formatDate(date: Date, options?: Intl.DateTimeFormatOptions): ReadonlySignal<string>;
    formatNumber(value: number, options?: Intl.NumberFormatOptions): ReadonlySignal<string>;
    private interpolate;
    getAvailableLocales(): Locale[];
    addTranslations(locale: Locale, translations: Translations): void;
    exportTranslations(locale: Locale): Translations | null;
}
declare function createInlineI18n(translations: LocaleData, config: I18nConfig): InlineI18n;
declare function setGlobalInlineI18n(i18n: InlineI18n): void;
declare function getGlobalInlineI18n(): InlineI18n;
export { createInlineI18n, getGlobalInlineI18n, InlineI18n, setGlobalInlineI18n, type I18nConfig, type Locale, type LocaleData, type TranslationKey, type Translations, type TranslationTokens, };
