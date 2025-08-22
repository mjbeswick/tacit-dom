import { computed, signal, type ReadonlySignal, type Signal } from './signals';

// Types for inline i18n
type Locale = string;
type TranslationKey = string;
type TranslationTokens = Record<string, string | number>;
type Translations = Record<string, string>;
type LocaleData = Record<Locale, Translations>;

// i18n configuration
type I18nConfig = {
  defaultLocale: Locale;
  fallbackLocale?: Locale;
  dateTimeFormats?: Record<Locale, Intl.DateTimeFormatOptions>;
  numberFormats?: Record<Locale, Intl.NumberFormatOptions>;
};

// Main i18n class for inline translations
class InlineI18n {
  private config: I18nConfig;
  private translations: LocaleData;
  private currentLocale: Signal<Locale>;
  private fallbackLocale: Signal<Locale | undefined>;

  constructor(translations: LocaleData, config: I18nConfig) {
    this.translations = translations;
    this.config = config;
    this.currentLocale = signal(config.defaultLocale);
    this.fallbackLocale = signal(config.fallbackLocale);
  }

  // Get current locale as a signal
  get locale(): Signal<Locale> {
    return this.currentLocale;
  }

  // Set locale
  setLocale(locale: Locale): void {
    if (this.translations[locale]) {
      this.currentLocale.set(locale);
    } else if (this.fallbackLocale.get()) {
      console.warn(`Locale '${locale}' not found, falling back to '${this.fallbackLocale.get()}'`);
      this.currentLocale.set(this.fallbackLocale.get()!);
    } else {
      console.warn(`Locale '${locale}' not found and no fallback specified`);
    }
  }

  // Main translation function - returns a computed value
  t(key: TranslationKey, defaultMessage: string, tokens?: TranslationTokens): ReadonlySignal<string> {
    return computed(() => {
      const locale = this.currentLocale.get();
      const fallback = this.fallbackLocale.get();

      // Try to get translation from current locale
      let translation = this.translations[locale]?.[key];

      // Fallback to fallback locale if no translation found
      if (!translation && fallback && locale !== fallback) {
        translation = this.translations[fallback]?.[key];
      }

      // Use translation if found, otherwise use default message
      const message = translation || defaultMessage;

      // Interpolate tokens if provided
      if (tokens && typeof message === 'string') {
        return this.interpolate(message, tokens);
      }

      return message;
    });
  }

  // Pluralization support
  n(key: TranslationKey, count: number, defaultMessage: string, tokens?: TranslationTokens): ReadonlySignal<string> {
    return computed(() => {
      const locale = this.currentLocale.get();
      const fallback = this.fallbackLocale.get();

      // Try to get plural-specific translation
      const countKey = count === 1 ? 'one' : 'other';
      const pluralKey = `${key}.${countKey}`;

      let translation = this.translations[locale]?.[pluralKey];

      if (!translation && fallback && locale !== fallback) {
        translation = this.translations[fallback]?.[pluralKey];
      }

      // Use translation if found, otherwise use default message
      const message = translation || defaultMessage;

      // Interpolate tokens if provided
      if (tokens && typeof message === 'string') {
        return this.interpolate(message, { count, ...tokens });
      }

      return message;
    });
  }

  // Date formatting
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): ReadonlySignal<string> {
    return computed(() => {
      const locale = this.currentLocale.get();
      const formatOptions = options || this.config.dateTimeFormats?.[locale];

      return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    });
  }

  // Number formatting
  formatNumber(value: number, options?: Intl.NumberFormatOptions): ReadonlySignal<string> {
    return computed(() => {
      const locale = this.currentLocale.get();
      const formatOptions = options || this.config.numberFormats?.[locale];

      return new Intl.NumberFormat(locale, formatOptions).format(value);
    });
  }

  // Interpolate tokens into a string
  private interpolate(text: string, tokens: TranslationTokens): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return tokens[key] !== undefined ? String(tokens[key]) : match;
    });
  }

  // Get all available locales
  getAvailableLocales(): Locale[] {
    return Object.keys(this.translations);
  }

  // Add or update translations for a locale
  addTranslations(locale: Locale, translations: Translations): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    Object.assign(this.translations[locale], translations);
  }

  // Export current translations for a locale
  exportTranslations(locale: Locale): Translations | null {
    return this.translations[locale] || null;
  }
}

// Factory function for inline i18n
function createInlineI18n(translations: LocaleData, config: I18nConfig): InlineI18n {
  return new InlineI18n(translations, config);
}

// Global inline i18n instance
let globalInlineI18n: InlineI18n | null = null;

function setGlobalInlineI18n(i18n: InlineI18n): void {
  globalInlineI18n = i18n;
}

function getGlobalInlineI18n(): InlineI18n {
  if (!globalInlineI18n) {
    throw new Error('Global inline i18n not initialized. Call setGlobalInlineI18n() first.');
  }
  return globalInlineI18n;
}

export {
  createInlineI18n,
  getGlobalInlineI18n,
  InlineI18n,
  setGlobalInlineI18n,
  type I18nConfig,
  type Locale,
  type LocaleData,
  type TranslationKey,
  type Translations,
  type TranslationTokens,
};
