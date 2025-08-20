# Tacit-DOM i18n Demo

This example demonstrates the internationalization (i18n) capabilities of Tacit-DOM, showing how to create multilingual applications with reactive translations.

## Features Demonstrated

- **Multi-language Support**: English, Spanish, French, and German
- **Default Messages**: Fallback text when translations are missing
- **Parameter Interpolation**: Dynamic content with placeholders like `{name}`
- **Pluralization**: Different text for singular/plural forms
- **Date & Number Formatting**: Locale-aware formatting
- **Namespaces**: Organized translation keys
- **Context-aware Translations**: Different translations based on context
- **Reactive Updates**: All text updates automatically when locale changes

## Quick Start

### 1. Install Dependencies

```bash
cd examples/i18n
npm install
```

### 2. Run the Demo

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Extract Translations

```bash
# Extract translations from source files
npm run extract
```

## Development

The demo uses Vite for fast development and building:

- **Port**: 3001 (configurable in `vite.config.ts`)
- **Hot Reload**: Automatic updates when files change
- **TypeScript**: Full type safety and IntelliSense
- **Source Maps**: Easy debugging

## File Structure

```
examples/i18n/
├── index.html          # Main HTML file
├── main.ts            # TypeScript application code
├── styles.css         # Styling
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
├── locales/           # Translation files
│   ├── en.json       # English translations
│   ├── es.json       # Spanish translations
│   ├── fr.json       # French translations
│   └── de.json       # German translations
└── README.md          # This file
```

## Translation Structure

The demo includes translations for:

- **Welcome messages** (`welcome.title`, `welcome.subtitle`)
- **Counter examples** (`counter.title`, `counter.items`)
- **Greetings** (`greeting`)
- **Date and number formatting** (`date.today`, `number.example`)
- **Language names** (`language.en`, `language.es`, etc.)
- **Namespace examples** (`user.title`, `user.description`)
- **Context examples** (`context.home.*`, `context.about.*`)

## Key Concepts

### 1. Translation Function (`t`)

```typescript
// Basic usage with key only
t('welcome.title');

// With default message
t('welcome.title', 'Welcome to Tacit-DOM!');

// With parameters
t('greeting', 'Hello, {name}!', { name: 'World' });
```

### 2. Pluralization (`n`)

```typescript
// Automatically handles singular/plural forms
n('counter.items', count, 'You have {count} items', { count });
```

### 3. Namespaces

```typescript
const userNamespace = useNamespace('user');
userNamespace.t('title', 'User Profile');
```

### 4. Context-aware Translations

```typescript
const homeContext = useNamespace('context.home');
homeContext.t('title', 'Home Page');
```

### 5. Date and Number Formatting

```typescript
formatDate(new Date()); // Locale-aware date formatting
formatNumber(1234.56); // Locale-aware number formatting
```

## Adding New Languages

To add a new language:

1. Add the locale to the `supportedLocales` array in the extraction script
2. Create a new JSON file in the `locales/` directory
3. Run `npm run extract` to update all locale files

## Integration with Tacit-DOM

The i18n system is built on top of Tacit-DOM's reactive signals:

- **Reactive Locale**: Changing the locale automatically updates all translated text
- **Computed Values**: Translations are computed values that update when dependencies change
- **Automatic Cleanup**: No manual subscription management needed
- **Type Safety**: Full TypeScript support with generated types

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Make sure you've run `npm install` in the demo directory
   - Check that the Tacit-DOM library is properly built

2. **Translations not loading**
   - Verify the `locales/` directory exists with JSON files
   - Check browser console for fetch errors

3. **Type errors**
   - Ensure TypeScript is properly configured
   - Run `npm run extract` to regenerate types

## Next Steps

- Run `npm run extract` to see how the extraction script works
- Check the generated `locales/` directory for JSON files
- Review the generated TypeScript types
- Experiment with adding new translation keys and languages
- Try building and deploying the demo with `npm run build`
