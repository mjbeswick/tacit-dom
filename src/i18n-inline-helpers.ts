import { getGlobalInlineI18n } from './i18n-inline';

// Main inline translation function
export function t(
  key: string,
  defaultMessage: string,
  tokens?: Record<string, string | number>,
) {
  return getGlobalInlineI18n().t(key, defaultMessage, tokens);
}

// Pluralization helper
export function n(
  key: string,
  count: number,
  defaultMessage: string,
  tokens?: Record<string, string | number>,
) {
  return getGlobalInlineI18n().n(key, count, defaultMessage, tokens);
}

// Date formatting helper
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return getGlobalInlineI18n().formatDate(date, options);
}

// Number formatting helper
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
) {
  return getGlobalInlineI18n().formatNumber(value, options);
}

// Locale management helper
export function useLocale() {
  const i18n = getGlobalInlineI18n();
  return {
    locale: i18n.locale,
    setLocale: (locale: string) => i18n.setLocale(locale),
    availableLocales: i18n.getAvailableLocales(),
  };
}

// Namespace translation helper
export function useNamespace(namespace: string) {
  return {
    t: (
      key: string,
      defaultMessage: string,
      tokens?: Record<string, string | number>,
    ) => t(`${namespace}.${key}`, defaultMessage, tokens),
    n: (
      key: string,
      count: number,
      defaultMessage: string,
      tokens?: Record<string, string | number>,
    ) => n(`${namespace}.${key}`, count, defaultMessage, tokens),
  };
}
