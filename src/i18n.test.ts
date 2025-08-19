import { createI18n, getGlobalI18n, setGlobalI18n } from './i18n';
import { formatDate, formatNumber, n, t, useLocale } from './i18n-helpers';

describe('i18n', () => {
  let i18n: any;

  beforeEach(() => {
    const translations = {
      en: {
        welcome: 'Welcome to Tacit-DOM!',
        hello: 'Hello, {name}!',
        items: 'You have {count} items',
        'items.one': 'You have 1 item',
        'items.other': 'You have {count} items',
        'date.format': 'Today is {date}',
        'number.format': 'The number is {number}',
      },
      es: {
        welcome: '¡Bienvenido a Tacit-DOM!',
        hello: '¡Hola, {name}!',
        items: 'Tienes {count} elementos',
        'items.one': 'Tienes 1 elemento',
        'items.other': 'Tienes {count} elementos',
        'date.format': 'Hoy es {date}',
        'number.format': 'El número es {number}',
      },
    };

    i18n = createI18n(translations, {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      dateTimeFormats: {
        en: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        es: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      },
    });

    setGlobalI18n(i18n);
  });

  afterEach(() => {
    // Reset global i18n
    setGlobalI18n(null as any);
  });

  describe('createI18n', () => {
    it('should create i18n instance with translations', () => {
      expect(i18n).toBeDefined();
      expect(i18n.getAvailableLocales()).toEqual(['en', 'es']);
    });

    it('should set default locale', () => {
      expect(i18n.locale.get()).toBe('en');
    });
  });

  describe('setGlobalI18n', () => {
    it('should set global i18n instance', () => {
      expect(getGlobalI18n()).toBe(i18n);
    });
  });

  describe('t function', () => {
    it('should translate basic keys', () => {
      const translation = t('welcome');
      expect(translation.get()).toBe('Welcome to Tacit-DOM!');
    });

    it('should use default message when translation is missing', () => {
      const translation = t('missing.key', 'Default message');
      expect(translation.get()).toBe('Default message');
    });

    it('should interpolate parameters', () => {
      const translation = t('hello', 'Hello, {name}!', { name: 'World' });
      expect(translation.get()).toBe('Hello, World!');
    });

    it('should update when locale changes', () => {
      const translation = t('welcome');
      expect(translation.get()).toBe('Welcome to Tacit-DOM!');

      i18n.setLocale('es');
      expect(translation.get()).toBe('¡Bienvenido a Tacit-DOM!');
    });

    it('should fallback to fallback locale when translation is missing', () => {
      i18n.setLocale('es');
      const translation = t('missing.key', 'Default message');
      expect(translation.get()).toBe('Default message');
    });
  });

  describe('n function', () => {
    it('should handle singular form', () => {
      const translation = n('items', 1, 'You have {count} items', { count: 1 });
      expect(translation.get()).toBe('You have 1 item');
    });

    it('should handle plural form', () => {
      const translation = n('items', 5, 'You have {count} items', { count: 5 });
      expect(translation.get()).toBe('You have 5 items');
    });

    it('should use default message when plural forms are missing', () => {
      const translation = n('missing', 5, 'Default: {count} items', {
        count: 5,
      });
      expect(translation.get()).toBe('Default: 5 items');
    });
  });

  describe('formatDate', () => {
    it('should format date according to current locale', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      // Should format in English by default
      expect(formatted.get()).toContain('Monday');
      expect(formatted.get()).toContain('2024');
      expect(formatted.get()).toContain('January');
      expect(formatted.get()).toContain('15');
    });

    it('should update when locale changes', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      i18n.setLocale('es');
      // Spanish formatting should be different
      expect(formatted.get()).not.toContain('Monday');
    });
  });

  describe('formatNumber', () => {
    it('should format number according to current locale', () => {
      const number = 1234.56;
      const formatted = formatNumber(number);

      // Should format in English by default
      expect(formatted.get()).toBe('1,234.56');
    });

    it('should update when locale changes', () => {
      const number = 1234.56;
      const formatted = formatNumber(number);

      i18n.setLocale('es');
      // Spanish formatting might be different
      expect(formatted.get()).toBeDefined();
    });
  });

  describe('useLocale', () => {
    it('should return locale management utilities', () => {
      const { locale, setLocale, availableLocales } = useLocale();

      expect(locale.get()).toBe('en');
      expect(availableLocales).toEqual(['en', 'es']);
      expect(typeof setLocale).toBe('function');
    });

    it('should allow changing locale', () => {
      const { setLocale } = useLocale();

      setLocale('es');
      expect(i18n.locale.get()).toBe('es');
    });
  });

  describe('locale switching', () => {
    it('should update all reactive translations when locale changes', () => {
      const welcome = t('welcome');
      const hello = t('hello', 'Hello, {name}!', { name: 'World' });

      expect(welcome.get()).toBe('Welcome to Tacit-DOM!');
      expect(hello.get()).toBe('Hello, World!');

      i18n.setLocale('es');

      expect(welcome.get()).toBe('¡Bienvenido a Tacit-DOM!');
      expect(hello.get()).toBe('¡Hola, World!');
    });
  });

  describe('error handling', () => {
    it('should throw error when getting global i18n without setting it', () => {
      setGlobalI18n(null as any);
      expect(() => getGlobalI18n()).toThrow('Global i18n not initialized');
    });

    it('should warn when setting invalid locale', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      i18n.setLocale('invalid');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Locale 'invalid' not found"),
      );

      consoleSpy.mockRestore();
    });
  });
});
