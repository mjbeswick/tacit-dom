import { button, computed, div, render, signal, span } from '../../src/index';

// Static styles
function createStaticStyles() {
  return div(
    { className: 'demo-item' },
    h3('String-based styles'),
    div(
      {
        style: 'background-color: #ff6b6b; color: white; padding: 15px; border-radius: 8px;',
      },
      'This div uses a CSS string for styling',
    ),

    h3('Object-based styles'),
    div(
      {
        style: {
          backgroundColor: '#4ecdc4',
          color: 'white',
          padding: 15,
          borderRadius: 8,
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      'This div uses a style object (React-like)',
    ),

    h3('Mixed style properties'),
    div(
      {
        style: {
          backgroundColor: '#45b7d1',
          color: 'white',
          padding: '20px',
          borderRadius: 12,
          fontSize: 16,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transform: 'rotate(2deg)',
        },
      },
      'Mixed string and numeric values',
    ),
  );
}

// Reactive styles
function createReactiveStyles() {
  const colorSignal = signal('#ff6b6b');
  const sizeSignal = signal(16);
  const rotationSignal = signal(0);

  const dynamicStyle = computed(() => ({
    backgroundColor: colorSignal.get(),
    fontSize: sizeSignal.get(),
    transform: `rotate(${rotationSignal.get()}deg)`,
    padding: 15,
    color: 'white',
    borderRadius: 8,
    textAlign: 'center',
    transition: 'all 0.3s ease',
  }));

  return div(
    { className: 'demo-item' },
    h3('Reactive Styles'),
    div({ style: dynamicStyle }, 'This div has reactive styles!'),

    div(
      { style: { marginTop: 15 } },
      button(
        {
          onClick: () => colorSignal.set(colorSignal.get() === '#ff6b6b' ? '#4ecdc4' : '#ff6b6b'),
          style: { margin: 5, padding: '8px 16px' },
        },
        'Change Color',
      ),
      button(
        {
          onClick: () => sizeSignal.set(sizeSignal.get() === 16 ? 24 : 16),
          style: { margin: 5, padding: '8px 16px' },
        },
        'Change Size',
      ),
      button(
        {
          onClick: () => rotationSignal.set(rotationSignal.get() === 0 ? 5 : 0),
          style: { margin: 5, padding: '8px 16px' },
        },
        'Toggle Rotation',
      ),
    ),
  );
}

// Mixed styles with signals in object values
function createMixedStyles() {
  const redSignal = signal(255);
  const greenSignal = signal(100);
  const blueSignal = signal(100);

  const colorStyle = computed(() => ({
    backgroundColor: `rgb(${redSignal.get()}, ${greenSignal.get()}, ${blueSignal.get()})`,
    color: 'white',
    padding: 20,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  }));

  return div(
    { className: 'demo-item' },
    h3('Mixed Styles with Signals'),
    div({ style: colorStyle }, 'RGB Color Mixer'),

    div(
      { style: { marginTop: 15 } },
      div(
        { style: { marginBottom: 10 } },
        span('Red: '),
        input({
          type: 'range',
          min: 0,
          max: 255,
          value: redSignal.get(),
          onInput: (e) => redSignal.set(parseInt((e.target as HTMLInputElement).value)),
          style: { width: 150, margin: '0 10px' },
        }),
        span(redSignal.get().toString()),
      ),
      div(
        { style: { marginBottom: 10 } },
        span('Green: '),
        input({
          type: 'range',
          min: 0,
          max: 255,
          value: greenSignal.get(),
          onInput: (e) => greenSignal.set(parseInt((e.target as HTMLInputElement).value)),
          style: { width: 150, margin: '0 10px' },
        }),
        span(greenSignal.get().toString()),
      ),
      div(
        { style: { marginBottom: 10 } },
        span('Blue: '),
        input({
          type: 'range',
          min: 0,
          max: 255,
          value: blueSignal.get(),
          onInput: (e) => blueSignal.set(parseInt((e.target as HTMLInputElement).value)),
          style: { width: 150, margin: '0 10px' },
        }),
        span(blueSignal.get().toString()),
      ),
    ),
  );
}

// Helper function for h3
function h3(text: string) {
  return div({ style: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' } }, text);
}

// Helper function for input
function input(props: any) {
  const element = document.createElement('input');
  Object.assign(element, props);
  return element;
}

// Render the demo
render(createStaticStyles(), document.getElementById('static-styles')!);
render(createReactiveStyles(), document.getElementById('reactive-styles')!);
render(createMixedStyles(), document.getElementById('mixed-styles')!);
