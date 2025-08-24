import { button, computed, div, h3, input, p, render, signal, span } from 'tacit-dom';
import styles from './styles.module.css';

// Theme management
const currentTheme = signal<'light' | 'dark'>('light');

// Theme toggle functionality
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;

  themeToggle.addEventListener('click', () => {
    const newTheme = currentTheme.get() === 'light' ? 'dark' : 'light';
    currentTheme.set(newTheme);

    // Update document attribute for CSS variables
    document.documentElement.setAttribute('data-theme', newTheme);

    // Update button text and icon
    themeToggle.textContent = newTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
  });
}

// Theme-aware styles using CSS modules
function createThemeAwareStyles() {
  return div(
    { className: styles.demoItem },
    h3('Theme-Aware Styles'),
    div(
      { className: styles.themeAwareContainer },
      p('This element automatically adapts to the current theme!'),
      p('Try toggling between light and dark mode using the button in the top-right corner.'),
      p('All colors, borders, and shadows will smoothly transition between themes.'),
    ),
  );
}

// Enhanced static styles with CSS modules
function createStaticStyles() {
  return div(
    { className: styles.demoItem },
    h3('String-based styles with CSS Variables'),
    div({ className: styles.staticStylesPrimary }, 'This div uses CSS variables for theming'),

    h3('Object-based styles with theme integration'),
    div({ className: styles.staticStylesSecondary }, 'This div uses a style object with CSS variables'),

    h3('Mixed style properties with theme awareness'),
    div({ className: styles.staticStylesInfo }, 'Mixed string and numeric values with theme integration'),
  );
}

// Enhanced reactive styles with CSS modules
function createReactiveStyles() {
  const colorSignal = signal('var(--accent-primary)');
  const sizeSignal = signal(16);
  const rotationSignal = signal(0);
  const useThemeColors = signal(true);

  const dynamicStyle = computed(() => ({
    backgroundColor: useThemeColors.get() ? colorSignal.get() : '#ff6b6b',
    fontSize: sizeSignal.get(),
    transform: `rotate(${rotationSignal.get()}deg)`,
  }));

  return div(
    { className: styles.demoItem },
    h3('Reactive Styles with Theme Integration'),
    div(
      {
        className: styles.reactiveContainer,
        style: dynamicStyle,
      },
      'This div has reactive styles that work with themes!',
    ),

    div(
      { className: styles.buttonContainer },
      button(
        {
          onClick: () => {
            if (useThemeColors.get()) {
              colorSignal.set(
                colorSignal.get() === 'var(--accent-primary)' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
              );
            } else {
              colorSignal.set(colorSignal.get() === '#ff6b6b' ? '#4ecdc4' : '#ff6b6b');
            }
          },
          className: `${styles.button} ${styles.buttonPrimary}`,
        },
        'Change Color',
      ),
      button(
        {
          onClick: () => sizeSignal.set(sizeSignal.get() === 16 ? 24 : 16),
          className: `${styles.button} ${styles.buttonSecondary}`,
        },
        'Change Size',
      ),
      button(
        {
          onClick: () => rotationSignal.set(rotationSignal.get() === 0 ? 5 : 0),
          className: `${styles.button} ${styles.buttonInfo}`,
        },
        'Toggle Rotation',
      ),
      button(
        {
          onClick: () => useThemeColors.set(!useThemeColors.get()),
          className: `${styles.button} ${useThemeColors.get() ? styles.buttonSuccess : styles.buttonWarning}`,
        },
        useThemeColors.get() ? 'Use Fixed Colors' : 'Use Theme Colors',
      ),
    ),
  );
}

// Enhanced mixed styles with CSS modules
function createMixedStyles() {
  const redSignal = signal(255);
  const greenSignal = signal(100);
  const blueSignal = signal(100);
  const useThemeBackground = signal(true);

  const colorStyle = computed(() => ({
    backgroundColor: useThemeBackground.get()
      ? `rgba(${redSignal.get()}, ${greenSignal.get()}, ${blueSignal.get()}, 0.8)`
      : `rgb(${redSignal.get()}, ${greenSignal.get()}, ${blueSignal.get()})`,
    backdropFilter: useThemeBackground.get() ? 'blur(10px)' : 'none',
  }));

  return div(
    { className: styles.demoItem },
    h3('Mixed Styles with Theme Integration'),
    div(
      {
        className: styles.rgbMixerContainer,
        style: colorStyle,
      },
      'RGB Color Mixer with Theme Support',
    ),

    div(
      { style: { marginTop: 15 } },
      div(
        { className: styles.controlRow },
        span({ className: styles.controlLabel }, 'Red: '),
        input({
          type: 'range',
          min: 0,
          max: 255,
          value: redSignal.get().toString(),
          onInput: (e) => {
            if (e.target) {
              redSignal.set(parseInt(e.target.value));
            }
          },
          className: `${styles.controlSlider} ${styles.controlSliderPrimary}`,
        }),
        span({ className: styles.controlValue }, redSignal.get().toString()),
      ),
      div(
        { className: styles.controlRow },
        span({ className: styles.controlLabel }, 'Green: '),
        input({
          type: 'range',
          min: 0,
          max: 255,
          value: greenSignal.get().toString(),
          onInput: (e) => {
            if (e.target) {
              greenSignal.set(parseInt(e.target.value));
            }
          },
          className: `${styles.controlSlider} ${styles.controlSliderSecondary}`,
        }),
        span({ className: styles.controlValue }, greenSignal.get().toString()),
      ),
      div(
        { className: styles.controlRow },
        span({ className: styles.controlLabel }, 'Blue: '),
        input({
          type: 'range',
          min: 0,
          max: 255,
          value: blueSignal.get().toString(),
          onInput: (e) => {
            if (e.target) {
              blueSignal.set(parseInt(e.target.value));
            }
          },
          className: `${styles.controlSlider} ${styles.controlSliderInfo}`,
        }),
        span({ className: styles.controlValue }, blueSignal.get().toString()),
      ),
      button(
        {
          onClick: () => useThemeBackground.set(!useThemeBackground.get()),
          className: `${styles.controlButton} ${useThemeBackground.get() ? styles.buttonSuccess : styles.buttonWarning}`,
        },
        useThemeBackground.get() ? 'Disable Theme Background' : 'Enable Theme Background',
      ),
    ),
  );
}

// Enhanced conditional rendering with CSS modules
function createConditionalRendering() {
  const showExtra = signal(false);
  const showDetails = signal(true);
  const count = signal(0);

  return div(
    { className: styles.demoItem },
    h3('Conditional Rendering with Theme Integration'),
    div(
      { className: styles.conditionalContainer },
      p('This demonstrates how falsy values are automatically filtered out:'),
      p('Hello', null, undefined, false, 0, '', 'World'), // Only "HelloWorld" will render
      p('Conditional content:', showExtra.get() && 'Extra content here'),
      p('Details:', showDetails.get() ? 'Visible' : null),
      p('Count:', count.get() || 'No count yet'),
    ),
    div(
      { className: styles.buttonContainer },
      button(
        {
          onClick: () => showExtra.set(!showExtra.get()),
          className: `${styles.button} ${styles.buttonPrimary}`,
        },
        showExtra.get() ? 'Hide Extra' : 'Show Extra',
      ),
      button(
        {
          onClick: () => showDetails.set(!showDetails.get()),
          className: `${styles.button} ${styles.buttonSecondary}`,
        },
        showDetails.get() ? 'Hide Details' : 'Show Details',
      ),
      button(
        {
          onClick: () => count.set(count.get() + 1),
          className: `${styles.button} ${styles.buttonInfo}`,
        },
        'Increment Count',
      ),
    ),
  );
}

// Theme showcase section with CSS modules
function createThemeShowcase() {
  const colorPalette = [
    { name: 'Primary', var: 'var(--accent-primary)' },
    { name: 'Secondary', var: 'var(--accent-secondary)' },
    { name: 'Success', var: 'var(--success)' },
    { name: 'Warning', var: 'var(--warning)' },
    { name: 'Error', var: 'var(--error)' },
    { name: 'Info', var: 'var(--info)' },
  ];

  return div(
    { className: styles.demoItem },
    h3('Theme Color Palette'),
    p('These colors automatically adapt to the current theme:'),
    div(
      { className: styles.colorPalette },
      ...colorPalette.map((color) =>
        div(
          {
            className: styles.colorPaletteItem,
            style: { backgroundColor: color.var },
          },
          div({ className: styles.colorPaletteName }, color.name),
          div({ className: styles.colorPaletteVar }, color.var),
        ),
      ),
    ),
  );
}

// Initialize theme
document.documentElement.setAttribute('data-theme', currentTheme.get());

// Setup theme toggle
setupThemeToggle();

// Render all demo sections
render(createThemeAwareStyles(), document.getElementById('theme-aware-styles')!);
render(createStaticStyles(), document.getElementById('static-styles')!);
render(createReactiveStyles(), document.getElementById('reactive-styles')!);
render(createMixedStyles(), document.getElementById('mixed-styles')!);
render(createConditionalRendering(), document.getElementById('conditional-rendering')!);
render(createThemeShowcase(), document.getElementById('theme-showcase')!);
