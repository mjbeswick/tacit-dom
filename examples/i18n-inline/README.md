# Tacit-DOM Inline i18n Demo

This demo showcases the inline i18n implementation in Tacit-DOM, using static JSON imports so translations are bundled with the app (no runtime fetching required).

## Features

- **Inline Translation Calls**: Use `t('<key>', '<description>', { tokens })` directly in your code
- **Static JSON Imports**: Import locale JSON files at build time for zero network fetches
- **Token Interpolation**: Support for dynamic values in translations
- **Pluralization**: Built-in pluralization support with `n()` function
- **Namespaces**: Organize translations with namespaces
- **Reactive**: All translations are reactive and update automatically when locale changes

## Usage

### Basic Translation

```typescript
import { t } from 'tacit-dom';

// Simple translation
t('welcome.title', 'Welcome to Tacit-DOM!');

// Translation with tokens
t('greeting', 'Hello, {name}!', { name: userName });
```

### Pluralization

```typescript
import { n } from 'tacit-dom';

n('counter.items', count, 'You have {count} items', { count });
```

### Namespaces

```typescript
import { useNamespace } from 'tacit-dom';

const userNamespace = useNamespace('user');
userNamespace.t('title', 'User Profile');
```

## Running the Demo

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3001`

## Translations

Translations are imported statically:

```typescript
import en from '../i18n/locales/en.json';
import es from '../i18n/locales/es.json';
import fr from '../i18n/locales/fr.json';
import de from '../i18n/locales/de.json';

const translations = { en, es, fr, de };
```

These JSON files are bundled by Vite (see `tsconfig.json` with `resolveJsonModule` enabled).

## Type Safety

Types are automatically inferred from the JSON files when you import them directly:

```typescript
import enTranslations from '../locales/en.json';

// TypeScript infers the structure automatically
const title = enTranslations.welcome.title; // Fully typed!
```

## Benefits

1. **Developer Experience**: See translations directly in your code
2. **Bundled Assets**: No runtime fetching or CORS concerns
3. **Type Safety**: JSON imports provide structural typing
4. **Reactive**: Automatic updates when locale changes
