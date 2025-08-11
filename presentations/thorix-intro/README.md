Thorix Intro Slides (Marp)

These slides introduce Thorix, contrast it with React, and demonstrate the core APIs with runnable examples.

View the deck

- VS Code Marp extension: open `thorix-intro.md` and preview
- Local package with scripts (recommended):
  - `cd presentations/thorix-intro`
  - `npm install`
  - Live server: `npm start` (serves the deck with reload)
  - Build HTML: `npm run build:html` (outputs to `dist/`)
  - Build PDF: `npm run build:pdf` (outputs to `dist/`)

Note: The deck references `docs/images/thorix_banner.svg`; scripts use `--allow-local-files` to enable loading it.

Contents

- Why Thorix vs React
- Signals, Computed, Effects, Batch
- Typed DOM creators and reactive attributes
- Lists, forms, render/cleanup, preserved signals
- Router: loaders, errors, navigation

License

- MIT, see repository root `LICENSE`.
