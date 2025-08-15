# Locale Files

This directory contains automatically generated locale files for the Thorix i18n examples.

## Files

- `en.json` - Default locale (English)
- `es.json` - Spanish translations
- `fr.json` - French translations
- `de.json` - German translations
- `ja.json` - Japanese translations
- `zh.json` - Chinese translations
- `usage-report.md` - Usage documentation

## Type Inference from JSON

Instead of generating TypeScript types, you can use the JSON files directly for type inference:

### Method 1: Import JSON with TypeScript

```typescript
// Import the JSON file directly
import enTranslations from '../locales/en.json';

// TypeScript will infer the structure automatically
type TranslationKeys = keyof typeof enTranslations;
type WelcomeTitle = (typeof enTranslations)['welcome']['title'];

// Use in your code
const title: WelcomeTitle = enTranslations.welcome.title; // "Welcome to Thorix!"
```

### Method 2: Dynamic Import

```typescript
// Dynamic import for runtime loading
async function loadTranslations(locale: string) {
  const translations = await import(`../locales/${locale}.json`);
  return translations.default;
}

// TypeScript will still provide type safety
const en = await loadTranslations('en');
const title = en.welcome.title; // Fully typed!
```

### Method 3: Type Assertion

```typescript
// If you need to assert the type
import enTranslations from '../locales/en.json';

type Translations = typeof enTranslations;
const translations: Translations = enTranslations;

// Now you have full type safety
const greeting = translations.greeting; // "Hello, {name}!"
```

## Benefits of Direct JSON Import

1. **No Generated Files** - Types are inferred directly from JSON
2. **Always Up-to-Date** - Types automatically match the JSON structure
3. **Simpler Workflow** - No need to run type generation scripts
4. **Better Performance** - No additional build step for types
5. **IDE Support** - Full autocomplete and type checking in modern editors

## Regenerating Locale Files

To regenerate the locale files after adding new translations:

```bash
npm run i18n:extract:ast
```

This will:

- Parse your TypeScript files for `t()` calls
- Extract translation keys and default messages
- Generate JSON files for all supported locales
- Create a usage report

## Adding New Translations

Simply use the `t()` function in your code:

```typescript
import { t } from 'thorix';

// New translation
t('new.key', 'This is a new translation');

// With tokens
t('welcome.user', 'Welcome, {name}!', { name: userName });
```

Then run the extraction script to update the locale files.
