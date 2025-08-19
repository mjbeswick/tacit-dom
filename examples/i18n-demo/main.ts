import {
  button,
  createI18n,
  div,
  formatDate,
  formatNumber,
  h1,
  h2,
  h3,
  n,
  p,
  render,
  setGlobalI18n,
  span,
  t,
  useLocale,
  useNamespace,
} from '../../src/index';

// Load translations from JSON files
async function loadTranslations(): Promise<Record<string, any>> {
  const locales = ['en', 'es', 'fr', 'de'];
  const translations: Record<string, any> = {};

  for (const locale of locales) {
    try {
      const response = await fetch(`../locales/${locale}.json`);
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
    { className: 'min-vh-100 d-flex flex-column' },

    // Header with language switcher
    div(
      { className: 'bg-primary text-white py-5 flex-shrink-0' },
      div(
        { className: 'container' },
        div(
          { className: 'row align-items-center' },
          div(
            { className: 'col-lg-8 col-md-7 mb-3 mb-md-0' },
            h1(
              { className: 'display-4 mb-2' },
              t('welcome.title', 'Welcome to Tacit-DOM!'),
            ),
            p(
              { className: 'lead mb-0' },
              t('welcome.subtitle', 'A reactive library with i18n support'),
            ),
          ),
          div(
            { className: 'col-lg-4 col-md-5' },
            // Language switcher
            div(
              {
                className:
                  'd-flex flex-wrap gap-2 justify-content-md-end justify-content-center',
              },
              ...availableLocales.map((lang) =>
                button(
                  {
                    onclick: () => setLocale(lang),
                    className: `btn ${locale.get() === lang ? 'btn-light' : 'btn-outline-light'} flex-fill flex-md-grow-0`,
                  },
                  t(`language.${lang}`, lang),
                ),
              ),
            ),
          ),
        ),
      ),
    ),

    // Main content - flexible and growing
    div(
      { className: 'container flex-grow-1 py-4' },

      // Counter section
      div(
        { className: 'row g-4 mb-4' },
        div(
          { className: 'col-xl-6 col-lg-12' },
          div(
            { className: 'card shadow-sm h-100' },
            div(
              { className: 'card-body d-flex flex-column' },
              h2(
                { className: 'card-title h4 mb-3' },
                t('counter.title', 'Counter Example'),
              ),
              div(
                { className: 'flex-grow-1' },
                p(
                  { className: 'card-text' },
                  n('counter.items', count, 'You have {count} items', {
                    count,
                  }),
                ),
                p(
                  { className: 'card-text' },
                  t('greeting', 'Hello, {name}!', { name: userName }),
                ),
              ),
            ),
          ),
        ),

        // Date and number formatting
        div(
          { className: 'col-xl-6 col-lg-12' },
          div(
            { className: 'card shadow-sm h-100' },
            div(
              { className: 'card-body d-flex flex-column' },
              h2(
                { className: 'card-title h4 mb-3' },
                'Date & Number Formatting',
              ),
              div(
                { className: 'flex-grow-1' },
                p(
                  { className: 'card-text' },
                  t('date.today', 'Today is {date}', {
                    date: formatDate(today).get(),
                  }),
                ),
                p(
                  { className: 'card-text' },
                  t('number.example', 'The number is {number}', {
                    number: formatNumber(exampleNumber).get(),
                  }),
                ),
              ),
            ),
          ),
        ),
      ),

      // Namespace and Context examples in a flexible row
      div(
        { className: 'row g-4 mb-4' },
        // Namespace example
        div(
          { className: 'col-lg-6' },
          div(
            { className: 'card shadow-sm h-100' },
            div(
              { className: 'card-body d-flex flex-column' },
              h2(
                { className: 'card-title h4 mb-3' },
                userNamespace.t('title', 'User Profile'),
              ),
              div(
                { className: 'flex-grow-1' },
                p(
                  { className: 'card-text' },
                  userNamespace.t(
                    'description',
                    'Manage your account settings',
                  ),
                ),
              ),
            ),
          ),
        ),

        // Context examples
        div(
          { className: 'col-lg-6' },
          div(
            { className: 'card shadow-sm h-100' },
            div(
              { className: 'card-body d-flex flex-column' },
              h2({ className: 'card-title h4 mb-3' }, 'Context Examples'),
              div(
                { className: 'flex-grow-1' },
                div(
                  { className: 'row g-3' },
                  div(
                    { className: 'col-12' },
                    div(
                      {
                        className:
                          'border-start border-success border-4 ps-3 py-2',
                      },
                      h3(
                        { className: 'h5 text-success mb-2' },
                        homeContext.t('title', 'Home Page'),
                      ),
                      p(
                        { className: 'text-muted mb-0' },
                        homeContext.t(
                          'description',
                          'Welcome to our application',
                        ),
                      ),
                    ),
                  ),
                  div(
                    { className: 'col-12' },
                    div(
                      {
                        className:
                          'border-start border-info border-4 ps-3 py-2',
                      },
                      h3(
                        { className: 'h5 text-info mb-2' },
                        aboutContext.t('title', 'About Us'),
                      ),
                      p(
                        { className: 'text-muted mb-0' },
                        aboutContext.t(
                          'description',
                          'Learn more about our company',
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),

      // Current locale display - full width
      div(
        { className: 'row' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2({ className: 'card-title h4 mb-3' }, 'Current Locale'),
              div(
                { className: 'row g-3' },
                div(
                  { className: 'col-md-6' },
                  p(
                    { className: 'card-text d-flex align-items-center gap-2' },
                    span('Current locale: '),
                    span({ className: 'badge bg-primary fs-6' }, locale),
                  ),
                ),
                div(
                  { className: 'col-md-6' },
                  p(
                    { className: 'card-text d-flex align-items-center gap-2' },
                    span('Available locales: '),
                    div(
                      { className: 'd-flex flex-wrap gap-1' },
                      ...availableLocales.map((lang) =>
                        span({ className: 'badge bg-secondary' }, lang),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// Initialize i18n and render the app
initializeI18n();
