import {
  button,
  classNames,
  computed,
  div,
  h1,
  h2,
  input,
  p,
  render,
  signal,
} from '../../src/index';

const app = () => {
  // State signals
  const isActive = signal(false);
  const isDisabled = signal(false);
  const isLoading = signal(false);
  const theme = signal<'light' | 'dark'>('light');
  const size = signal<'small' | 'medium' | 'large'>('medium');
  const variant = signal<'primary' | 'secondary' | 'danger'>('primary');
  const isValid = signal(true);
  const isDirty = signal(false);

  // Computed class names
  const buttonClasses = computed(() =>
    classNames(
      'button',
      `button--${variant.get()}`,
      `button--${size.get()}`,
      `theme-${theme.get()}`,
      {
        'button--active': isActive.get(),
        'button--disabled': isDisabled.get(),
        'button--loading': isLoading.get(),
      },
    ),
  );

  const inputClasses = computed(() =>
    classNames('input', `input--${size.get()}`, {
      'input--valid': isValid.get(),
      'input--invalid': !isValid.get(),
      'input--dirty': isDirty.get(),
      'input--error': !isValid.get() && isDirty.get(),
    }),
  );

  const containerClasses = computed(() =>
    classNames('container', `theme-${theme.get()}`, {
      'container--loading': isLoading.get(),
      'container--disabled': isDisabled.get(),
    }),
  );

  // Event handlers
  const toggleActive = () => isActive.set(!isActive.get());
  const toggleDisabled = () => isDisabled.set(!isDisabled.get());
  const toggleLoading = () => isLoading.set(!isLoading.get());
  const toggleTheme = () =>
    theme.set(theme.get() === 'light' ? 'dark' : 'light');
  const toggleValid = () => isValid.set(!isValid.get());
  const toggleDirty = () => isDirty.set(!isDirty.get());

  const cycleSize = () => {
    const sizes: Array<'small' | 'medium' | 'large'> = [
      'small',
      'medium',
      'large',
    ];
    const currentIndex = sizes.indexOf(size.get());
    const nextIndex = (currentIndex + 1) % sizes.length;
    size.set(sizes[nextIndex]);
  };

  const cycleVariant = () => {
    const variants: Array<'primary' | 'secondary' | 'danger'> = [
      'primary',
      'secondary',
      'danger',
    ];
    const currentIndex = variants.indexOf(variant.get());
    const nextIndex = (currentIndex + 1) % variants.length;
    variant.set(variants[nextIndex]);
  };

  return div(
    { className: containerClasses },
    h1('ClassNames Utility Example'),

    div(
      { className: 'section' },
      h2('Button Classes'),
      p('Current classes: ', buttonClasses),
      div(
        { className: 'controls' },
        button({ onclick: toggleActive }, 'Toggle Active'),
        button({ onclick: toggleDisabled }, 'Toggle Disabled'),
        button({ onclick: toggleLoading }, 'Toggle Loading'),
        button({ onclick: toggleTheme }, 'Toggle Theme'),
        button({ onclick: cycleSize }, 'Cycle Size'),
        button({ onclick: cycleVariant }, 'Cycle Variant'),
      ),
      div(
        { className: 'demo' },
        button(
          {
            className: buttonClasses,
            onclick: toggleActive,
            disabled: isDisabled.get(),
          },
          isLoading.get() ? 'Loading...' : 'Interactive Button',
        ),
      ),
    ),

    div(
      { className: 'section' },
      h2('Input Classes'),
      p('Current classes: ', inputClasses),
      div(
        { className: 'controls' },
        button({ onclick: toggleValid }, 'Toggle Valid'),
        button({ onclick: toggleDirty }, 'Toggle Dirty'),
      ),
      div(
        { className: 'demo' },
        input({
          className: inputClasses,
          placeholder: 'Type something...',
          oninput: () => isDirty.set(true),
        }),
      ),
    ),

    div(
      { className: 'section' },
      h2('Complex Examples'),
      div(
        { className: 'example' },
        p('Navigation with active state:'),
        div(
          {
            className: classNames(
              'nav-item',
              { 'nav-item--active': isActive.get() },
              { 'nav-item--current': true },
            ),
          },
          'Home',
        ),
        div(
          {
            className: classNames(
              'nav-item',
              { 'nav-item--active': !isActive.get() },
              { 'nav-item--current': false },
            ),
          },
          'About',
        ),
      ),

      div(
        { className: 'example' },
        p('Form validation states:'),
        div(
          {
            className: classNames(
              'form-group',
              { 'form-group--error': !isValid.get() && isDirty.get() },
              { 'form-group--success': isValid.get() && isDirty.get() },
            ),
          },
          'Form Group',
        ),
      ),

      div(
        { className: 'example' },
        p('Loading states:'),
        div(
          {
            className: classNames(
              'spinner',
              { 'spinner--loading': isLoading.get() },
              { 'spinner--saving': isLoading.get() && isActive.get() },
              { 'spinner--hidden': !isLoading.get() },
            ),
          },
          'Loading...',
        ),
      ),
    ),

    div(
      { className: 'section' },
      h2('Current State'),
      div(
        { className: 'state-grid' },
        p('Active: ', isActive.get() ? 'true' : 'false'),
        p('Disabled: ', isDisabled.get() ? 'true' : 'false'),
        p('Loading: ', isLoading.get() ? 'true' : 'false'),
        p('Theme: ', theme.get()),
        p('Size: ', size.get()),
        p('Variant: ', variant.get()),
        p('Valid: ', isValid.get() ? 'true' : 'false'),
        p('Dirty: ', isDirty.get() ? 'true' : 'false'),
      ),
    ),
  );
};

// Add some basic styles
const style = document.createElement('style');
style.textContent = `
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .theme-light {
    background: #f5f5f5;
    color: #333;
  }

  .theme-dark {
    background: #333;
    color: #f5f5f5;
  }

  .section {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .controls {
    margin: 10px 0;
  }

  .controls button {
    margin: 5px;
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
  }

  .demo {
    margin: 10px 0;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 4px;
  }

  .button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .button--primary {
    background: #007bff;
    color: white;
  }

  .button--secondary {
    background: #6c757d;
    color: white;
  }

  .button--danger {
    background: #dc3545;
    color: white;
  }

  .button--small {
    padding: 6px 12px;
    font-size: 12px;
  }

  .button--large {
    padding: 14px 28px;
    font-size: 16px;
  }

  .button--active {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button--loading {
    position: relative;
    color: transparent;
  }

  .button--loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .input--small {
    padding: 4px 8px;
    font-size: 12px;
  }

  .input--large {
    padding: 12px 16px;
    font-size: 16px;
  }

  .input--valid {
    border-color: #28a745;
  }

  .input--invalid {
    border-color: #dc3545;
  }

  .input--dirty {
    background: #fff3cd;
  }

  .input--error {
    background: #f8d7da;
  }

  .nav-item {
    display: inline-block;
    padding: 8px 16px;
    margin: 0 4px;
    border-radius: 4px;
    cursor: pointer;
  }

  .nav-item--active {
    background: #007bff;
    color: white;
  }

  .nav-item--current {
    font-weight: bold;
  }

  .form-group {
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }

  .form-group--error {
    background: #f8d7da;
    border: 1px solid #dc3545;
  }

  .form-group--success {
    background: #d4edda;
    border: 1px solid #28a745;
  }

  .spinner {
    padding: 10px;
    border-radius: 4px;
    text-align: center;
  }

  .spinner--loading {
    background: #e3f2fd;
  }

  .spinner--saving {
    background: #fff3cd;
  }

  .spinner--hidden {
    display: none;
  }

  .state-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-top: 20px;
  }

  .state-grid p {
    margin: 0;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
    font-family: monospace;
  }

  .example {
    margin: 15px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
  }
`;
document.head.appendChild(style);

// Render the app
render(app, document.getElementById('app')!);
