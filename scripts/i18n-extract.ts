#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Types
type TranslationKey = string;
type TranslationInfo = {
  key: string;
  defaultMessage: string;
  file: string;
  line: number;
  usage: Array<{
    file: string;
    line: number;
  }>;
};

type Namespace = string;
type Context = string;

// Configuration
const CONFIG = {
  sourceFiles: ['examples/**/*.{ts,tsx,js,jsx}'],
  localesDir: 'locales',
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
  keyPattern:
    /t\s*\(\s*['"`]([a-zA-Z][a-zA-Z0-9._-]*)['"`]\s*(?:,\s*['"`]([^'"`]+)['"`])?/g,
  namespacePattern: /useNamespace\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  contextPattern:
    /tWithContext\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g,
} as const;

// Detect if we're running from the demo directory
const isDemoDirectory = process.cwd().includes('i18n-demo');
if (isDemoDirectory) {
  CONFIG.sourceFiles = ['**/*.{ts,tsx,js,jsx}'];
  CONFIG.localesDir = 'locales';
  CONFIG.supportedLocales = ['en', 'es', 'fr', 'de'];
}



// Translation storage
const translations = new Map<TranslationKey, TranslationInfo>();
const namespaces = new Set<Namespace>();
const contexts = new Set<Context>();

// Extract translations from a file
function extractFromFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract regular t() calls
  let match: RegExpExecArray | null;
  while ((match = CONFIG.keyPattern.exec(content)) !== null) {
    const key = match[1];
    const defaultMessage = match[2] || '';

    if (!translations.has(key)) {
      translations.set(key, {
        key,
        defaultMessage,
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
        usage: [],
      });
    }

    translations.get(key)!.usage.push({
      file: filePath,
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // Extract namespace usage
  while ((match = CONFIG.namespacePattern.exec(content)) !== null) {
    namespaces.add(match[1]);
  }

  // Extract context usage
  while ((match = CONFIG.contextPattern.exec(content)) !== null) {
    contexts.add(match[2]);
  }

  // Extract namespace-based translation calls (e.g., userNamespace.t('title', '...'))
  const namespaceCallPattern =
    /(\w+Namespace|homeContext|aboutContext)\.t\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*['"`]([^'"`]+)['"`])?/g;
  while ((match = namespaceCallPattern.exec(content)) !== null) {
    const namespaceVar = match[1];
    const key = match[2];
    const defaultMessage = match[3] || '';

    // Determine the actual namespace from the variable name
    let actualNamespace = '';
    if (namespaceVar === 'userNamespace') actualNamespace = 'user';
    else if (namespaceVar === 'homeContext') actualNamespace = 'context.home';
    else if (namespaceVar === 'aboutContext') actualNamespace = 'context.about';

    if (actualNamespace) {
      const fullKey = `${actualNamespace}.${key}`;
      if (!translations.has(fullKey)) {
        translations.set(fullKey, {
          key: fullKey,
          defaultMessage,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length,
          usage: [],
        });
      }

      translations.get(fullKey)!.usage.push({
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }
}

// Create nested translation structure from flat keys
function createNestedTranslations(): Record<string, any> {
  const nested: Record<string, any> = {};

  for (const [key, info] of translations) {
    const keys = key.split('.');
    let current = nested;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = info.defaultMessage || key;
  }

  return nested;
}

// Clean up flat keys that should be nested
function cleanupFlatKeys(
  translations: Record<string, any>,
): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(translations)) {
    if (key.includes('.')) {
      // This is a flat key that should be nested
      const keys = key.split('.');
      let current = cleaned;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

// Create or update translation files
function createTranslationFiles(): void {
  const localesDir = CONFIG.localesDir;

  // Ensure locales directory exists
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  // Create default locale file with nested structure
  let defaultTranslations = createNestedTranslations();

  // Clean up any remaining flat keys
  defaultTranslations = cleanupFlatKeys(defaultTranslations);

  // Add namespace translations
  for (const namespace of namespaces) {
    if (!defaultTranslations[namespace]) {
      defaultTranslations[namespace] = {};
    }
    defaultTranslations[namespace].title = `${namespace} Title`;
    defaultTranslations[namespace].description = `${namespace} Description`;
  }

  // Add namespace translations
  for (const namespace of namespaces) {
    if (!defaultTranslations[namespace]) {
      defaultTranslations[namespace] = {};
    }
    defaultTranslations[namespace].title = `${namespace} Title`;
    defaultTranslations[namespace].description = `${namespace} Description`;
  }

  // Add context translations
  for (const context of contexts) {
    if (!defaultTranslations.context) {
      defaultTranslations.context = {};
    }
    if (!defaultTranslations.context[context]) {
      defaultTranslations.context[context] = {};
    }
    defaultTranslations.context[context].title = `${context} Title`;
    defaultTranslations.context[context].description = `${context} Description`;
  }

  // Write default locale file
  const defaultLocalePath = path.join(
    CONFIG.localesDir,
    `${CONFIG.defaultLocale}.json`,
  );
  fs.writeFileSync(
    defaultLocalePath,
    JSON.stringify(defaultTranslations, null, 2),
  );

  console.log(`✅ Created default locale file: ${defaultLocalePath}`);

  // Mark all string values for translation
  function markForTranslation(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = `[TRANSLATE] ${obj[key]}`;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        markForTranslation(obj[key]);
      }
    }
  }

  // Create other locale files
  for (const locale of CONFIG.supportedLocales) {
    if (locale === CONFIG.defaultLocale) continue;

    const localePath = path.join(CONFIG.localesDir, `${locale}.json`);
    const localeTranslations = JSON.parse(JSON.stringify(defaultTranslations));

    markForTranslation(localeTranslations);

    fs.writeFileSync(localePath, JSON.stringify(localeTranslations, null, 2));

    console.log(`✅ Created locale file: ${localePath}`);
  }
}

// Generate TypeScript types for translations
function generateTypes(): void {
  const typesPath = path.join(CONFIG.localesDir, 'types.ts');

  let typesContent = `// Auto-generated translation types
// Run 'npm run i18n:extract' to update

export type TranslationKeys = {\n`;

  for (const [key, info] of translations) {
    const comment = info.defaultMessage ? ` // ${info.defaultMessage}` : '';
    typesContent += `  '${key}': string;${comment}\n`;
  }

  // Add namespace types
  for (const namespace of namespaces) {
    typesContent += `  '${namespace}.title': string;\n`;
    typesContent += `  '${namespace}.description': string;\n`;
  }

  // Add context types
  for (const context of contexts) {
    typesContent += `  'context.${context}.title': string;\n`;
    typesContent += `  'context.${context}.description': string;\n`;
  }

  typesContent += `};

export type Locale = '${CONFIG.supportedLocales.join("' | '")}';
`;

  fs.writeFileSync(typesPath, typesContent);
  console.log(`✅ Generated TypeScript types: ${typesPath}`);
}

// Generate usage report
function generateUsageReport(): void {
  const reportPath = path.join(CONFIG.localesDir, 'usage-report.md');

  let report = `# Translation Usage Report

Generated on: ${new Date().toISOString()}

## Translation Keys (${translations.size})

`;

  for (const [key, info] of translations) {
    report += `### ${key}\n`;
    if (info.defaultMessage) {
      report += `- Default: "${info.defaultMessage}"\n`;
    }
    report += `- Usage:\n`;
    for (const usage of info.usage) {
      report += `  - ${usage.file}:${usage.line}\n`;
    }
    report += `\n`;
  }

  if (namespaces.size > 0) {
    report += `## Namespaces (${namespaces.size})\n`;
    for (const namespace of namespaces) {
      report += `- ${namespace}\n`;
    }
    report += `\n`;
  }

  if (contexts.size > 0) {
    report += `## Contexts (${contexts.size})\n`;
    for (const context of contexts) {
      report += `- ${context}\n`;
    }
    report += `\n`;
  }

  fs.writeFileSync(reportPath, report);
  console.log(`✅ Generated usage report: ${reportPath}`);
}

// Main extraction function
function extractTranslations(): void {
  console.log('🔍 Extracting translations from source files...');

  // Find all source files
  const files: string[] = [];
  for (const pattern of CONFIG.sourceFiles) {
    files.push(
      ...glob.sync(pattern, {
        ignore: ['node_modules/**', 'dist/**', 'build/**'],
      }),
    );
  }

  console.log(`Found ${files.length} source files`);

  // Extract from each file
  for (const file of files) {
    try {
      extractFromFile(file);
    } catch (error) {
      console.warn(
        `⚠️  Warning: Could not process ${file}:`,
        (error as Error).message,
      );
    }
  }

  console.log(`📝 Extracted ${translations.size} translation keys`);
  console.log(`📦 Found ${namespaces.size} namespaces`);
  console.log(`🎯 Found ${contexts.size} contexts`);

  // Create translation files
  createTranslationFiles();

  // Generate types
  generateTypes();

  // Generate usage report
  generateUsageReport();

  console.log('\n🎉 Translation extraction complete!');
  console.log('\nNext steps:');
  console.log(
    '1. Review the generated translation files in the locales/ directory',
  );
  console.log(
    '2. Translate the [TRANSLATE] marked strings in other locale files',
  );
  console.log('3. Use the generated types in your TypeScript code');
  console.log('4. Run this script again when you add new translations');
}

// CLI argument handling
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'extract':
  case undefined:
    extractTranslations();
    break;
  case 'help':
    console.log(`
Usage: node scripts/i18n-extract.ts [command]

Commands:
  extract    Extract translations from source files (default)
  help       Show this help message

The script will:
- Scan source files for t() function calls
- Extract translation keys and default messages
- Create nested JSON translation files for all supported locales
- Generate TypeScript types for type safety
- Create a usage report showing where each key is used

Configuration can be modified in the CONFIG object at the top of this script.
Note: Run from the demo directory to extract demo-specific translations.
`);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error(
      'Run "node scripts/i18n-extract.ts help" for usage information',
    );
    process.exit(1);
}
