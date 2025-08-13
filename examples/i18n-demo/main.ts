import {
  button,
  createI18n,
  div,
  formatDate,
  formatNumber,
  h1,
  h2,
  n,
  p,
  render,
  setGlobalI18n,
  span,
  t,
  useLocale,
  useNamespace,
} from 'thorix';

// Load translations from JSON files
async function loadTranslations(): Promise<Record<string, any>> {
  const locales = ['en', 'es', 'fr', 'de'];
  const translations: Record<string, any> = {};

  for (const locale of locales) {
    try {
      const response = await fetch(`locales/${locale}.json`);
      if (response.ok) {
        translations[locale] = await response.json();
      } else {
        console.warn(`Failed to load ${locale} translations`);
      }
    } catch (error) {
      console.warn(`Error loading ${locale} translations:`, error);
    }
  }

  return translations;
}

// Initialize i18n
let i18n: any;

async function initializeI18n() {
  const translations = await loadTranslations();

  i18n = createI18n(translations, {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    dateTimeFormats: {
      en: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      es: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      fr: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      de: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    },
  });

  setGlobalI18n(i18n);

  // Render the app after i18n is initialized
  render(App, document.getElementById('app')!);
}

// Main App Component
function App() {
  const { locale, setLocale, availableLocales } = useLocale();
  const userNamespace = useNamespace('user');
  const homeContext = useNamespace('context.home');
  const aboutContext = useNamespace('context.about');

  // Reactive values
  const count = 5;
  const userName = 'World';
  const today = new Date();
  const exampleNumber = 1234.56;

  return div(
    { className: 'app' },

    // Header with language switcher
    div(
      { className: 'header' },
      h1(t('welcome.title', 'Welcome to Thorix!')),
      p(t('welcome.subtitle', 'A reactive library with i18n support')),

      // Language switcher
      div(
        { className: 'language-switcher' },
        ...availableLocales.map((lang) =>
          button(
            {
              onclick: () => setLocale(lang),
              className: locale.get() === lang ? 'active' : '',
            },
            t(`language.${lang}`, lang),
          ),
        ),
      ),
    ),

    // Main content
    div(
      { className: 'content' },

      // Counter section
      div(
        { className: 'section' },
        h1(t('counter.title', 'Counter Example')),
        p(n('counter.items', count, 'You have {count} items', { count })),
        p(t('greeting', 'Hello, {name}!', { name: userName })),
      ),

      // Date and number formatting
      div(
        { className: 'section' },
        h1('Date & Number Formatting'),
        p(
          t('date.today', 'Today is {date}', {
            date: formatDate(today).get(),
          }),
        ),
        p(
          t('number.example', 'The number is {number}', {
            number: formatNumber(exampleNumber).get(),
          }),
        ),
      ),

      // Namespace example
      div(
        { className: 'section' },
        h1(userNamespace.t('title', 'User Profile')),
        p(userNamespace.t('description', 'Manage your account settings')),
      ),

      // Context examples
      div(
        { className: 'section' },
        h1('Context Examples'),
        div(
          { className: 'context-section' },
          h2(homeContext.t('title', 'Home Page')),
          p(homeContext.t('description', 'Welcome to our application')),
        ),
        div(
          { className: 'context-section' },
          h2(aboutContext.t('title', 'About Us')),
          p(aboutContext.t('description', 'Learn more about our company')),
        ),
      ),

      // Current locale display
      div(
        { className: 'section' },
        h1('Current Locale'),
        p(span('Current locale: '), span(locale)),
        p(span('Available locales: '), span(availableLocales.join(', '))),
      ),
    ),
  );
}

// Initialize i18n and render the app
initializeI18n();
