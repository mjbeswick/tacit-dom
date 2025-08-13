import { getGlobalI18n } from './i18n';

// Main translation function with default message support
export function t(
  key: string,
  defaultMessage?: string,
  params?: Record<string, any>,
) {
  return getGlobalI18n().t(key, defaultMessage, params);
}

// Pluralization helper with default message
export function n(
  key: string,
  count: number,
  defaultMessage?: string,
  params?: Record<string, any>,
) {
  return getGlobalI18n().n(key, count, defaultMessage, params);
}

// Date formatting helper
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return getGlobalI18n().formatDate(date, options);
}

// Number formatting helper
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
) {
  return getGlobalI18n().formatNumber(value, options);
}

// Locale management helper
export function useLocale() {
  const i18n = getGlobalI18n();
  return {
    locale: i18n.locale,
    setLocale: (locale: string) => i18n.setLocale(locale),
    availableLocales: i18n.getAvailableLocales(),
  };
}

// Context-aware translation helper
export function tWithContext(
  key: string,
  context: string,
  defaultMessage?: string,
  params?: Record<string, any>,
) {
  const contextKey = `${context}.${key}`;
  return t(contextKey, defaultMessage, params);
}

// Namespace translation helper
export function useNamespace(namespace: string) {
  return {
    t: (key: string, defaultMessage?: string, params?: Record<string, any>) =>
      t(`${namespace}.${key}`, defaultMessage, params),
    n: (
      key: string,
      count: number,
      defaultMessage?: string,
      params?: Record<string, any>,
    ) => n(`${namespace}.${key}`, count, defaultMessage, params),
  };
}
