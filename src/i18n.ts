import { computed, signal, type ReadonlySignal, type Signal } from './signals';

// Types for i18n
type Locale = string;
type TranslationKey = string;
type TranslationValue = string | ((params: Record<string, any>) => string) | Record<string, any>;
type Translations = Record<string, any>;
type LocaleData = Record<Locale, Translations>;

// i18n configuration
type I18nConfig = {
  defaultLocale: Locale;
  fallbackLocale?: Locale;
  dateTimeFormats?: Record<Locale, Intl.DateTimeFormatOptions>;
  numberFormats?: Record<Locale, Intl.NumberFormatOptions>;
};

// Main i18n class
class I18n {
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

  // Get translation as a computed value
  t(key: TranslationKey, defaultMessage?: string, params?: Record<string, any>): ReadonlySignal<string> {
    return computed(() => {
      const locale = this.currentLocale.get();
      const fallback = this.fallbackLocale.get();

      let translation = this.getNestedTranslation(this.translations[locale], key);

      if (!translation && fallback && locale !== fallback) {
        translation = this.getNestedTranslation(this.translations[fallback], key);
      }

      if (!translation) {
        // Use default message if provided, otherwise use key
        const message = defaultMessage || key;

        // If we have params, try to interpolate them into the default message
        if (params && typeof message === 'string') {
          return this.interpolate(message, params);
        }

        return message;
      }

      if (typeof translation === 'function') {
        return translation(params || {});
      }

      // Interpolate params into the translation
      if (params && typeof translation === 'string') {
        return this.interpolate(translation, params);
      }

      return translation;
    });
  }

  // Get nested translation value by dot notation key
  private getNestedTranslation(translations: any, key: string): any {
    if (!translations || typeof key !== 'string') return undefined;

    const keys = key.split('.');
    let current = translations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return current;
  }

  // Interpolate parameters into a string
  private interpolate(text: string, params: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  // Pluralization support
  n(key: TranslationKey, count: number, defaultMessage?: string, params?: Record<string, any>): ReadonlySignal<string> {
    return computed(() => {
      const countKey = count === 1 ? 'one' : 'other';
      const pluralKey = `${key}.${countKey}`;

      // First try to get the specific plural form from translations
      const locale = this.currentLocale.get();
      const fallback = this.fallbackLocale.get();

      let translation = this.getNestedTranslation(this.translations[locale], pluralKey);

      if (!translation && fallback && locale !== fallback) {
        translation = this.getNestedTranslation(this.translations[fallback], pluralKey);
      }

      if (translation) {
        // Use the translation if it exists
        if (typeof translation === 'function') {
          return translation({ count, ...params });
        }
        if (params && typeof translation === 'string') {
          return this.interpolate(translation, { count, ...params });
        }
        return translation;
      }

      // If no translation exists, apply basic pluralization to default message
      if (defaultMessage) {
        let message = defaultMessage;

        // Basic English pluralization: if count is 1, remove 's' from words ending with 's'
        if (count === 1) {
          message = message.replace(/\b(\w+)s\b/g, '$1');
        }

        // Interpolate parameters
        if (params) {
          message = this.interpolate(message, { count, ...params });
        }

        return message;
      }

      // Fallback to just the key with count
      return `${key}: ${count}`;
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

  // Add or update translations for a locale
  addTranslations(locale: Locale, translations: Translations): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    Object.assign(this.translations[locale], translations);
  }

  // Get all available locales
  getAvailableLocales(): Locale[] {
    return Object.keys(this.translations);
  }

  // Export current translations for a locale
  exportTranslations(locale: Locale): Translations | null {
    return this.translations[locale] || null;
  }
}

// Factory function
function createI18n(translations: LocaleData, config: I18nConfig): I18n {
  return new I18n(translations, config);
}

// Global i18n instance
let globalI18n: I18n | null = null;

function setGlobalI18n(i18n: I18n): void {
  globalI18n = i18n;
}

function getGlobalI18n(): I18n {
  if (!globalI18n) {
    throw new Error('Global i18n not initialized. Call setGlobalI18n() first.');
  }
  return globalI18n;
}

export {
  createI18n,
  getGlobalI18n,
  I18n,
  setGlobalI18n,
  type I18nConfig,
  type Locale,
  type LocaleData,
  type TranslationKey,
  type Translations,
  type TranslationValue,
};
