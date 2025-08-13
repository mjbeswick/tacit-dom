import {
  button,
  computed,
  div,
  effect,
  h1,
  h2,
  p,
  render,
  signal,
  span,
} from '../../src/index';

const random = () => Math.random().toString(36).slice(2, 6).toUpperCase();

const signalA = signal(random());
const signalB = signal(random());

const computedA = computed(() => {
  console.log('computed signalC');
  return signalA.get() + ' ' + signalB.get();
});

effect(() => {
  console.log('effect signalA', computedA.get());
});

// Add effect to log when signalA or signalB changes
effect(() => {
  console.log(`Signals updated - signalA: ${signalA}, signalB: ${signalB}`);
});

const app = () => {
  console.log(`app renders: ${signalA} ${signalB}`);

  const handleUpdate = () => {
    signalA.set(random());
    signalB.set(random());
    // Trigger a re-render to see the app function console.log
    render(app, document.getElementById('app')!);
  };

  // Use signal with key for preserved state between renders
  const signalD = signal(random(), 'signalD');

  // Regular signal without key - will be recreated on each render
  const regularSignal = signal(random());

  const computedB = computed(() => {
    console.log('computed signalB', signalD.get());
    return signalD.get();
  });

  effect(() => {
    console.log('effect signalB', computedB.get());
  });

  const handleReRender = () => {
    // Force a re-render by calling render again
    render(app, document.getElementById('app')!);
  };

  return div(
    { className: 'min-vh-100 d-flex flex-column' },

    // Header section
    div(
      { className: 'bg-primary text-white py-5 flex-shrink-0' },
      div(
        { className: 'container' },
        div(
          { className: 'row justify-content-center' },
          div(
            { className: 'col-lg-8 text-center' },
            h1({ className: 'display-4 mb-3' }, 'Thorix Signals Example'),
            p(
              { className: 'lead mb-0' },
              'Explore reactive signals, computed values, and effects',
            ),
          ),
        ),
      ),
    ),

    // Main content - flexible and growing
    div(
      { className: 'container flex-grow-1 py-4' },

      // Control buttons section
      div(
        { className: 'row mb-4' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body text-center' },
              h2({ className: 'card-title h4 mb-4' }, 'Signal Controls'),
              div(
                { className: 'd-flex gap-3 justify-content-center flex-wrap' },
                button(
                  {
                    onclick: handleUpdate,
                    className: 'btn btn-primary btn-lg',
                  },
                  'Update signals',
                ),
                button(
                  {
                    onclick: handleReRender,
                    className: 'btn btn-outline-primary btn-lg',
                  },
                  'Re-render (notice preserved signals maintain state)',
                ),
              ),
            ),
          ),
        ),
      ),

      // Signal values display section
      div(
        { className: 'row' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2({ className: 'card-title h4 mb-4' }, 'Signal Values'),
              div(
                { className: 'row g-3' },
                div(
                  { className: 'col-md-6' },
                  div(
                    { className: 'p-3 bg-light rounded' },
                    p(
                      { className: 'mb-2' },
                      span({ className: 'fw-bold text-primary' }, 'signalA: '),
                      span({ className: 'font-monospace' }, signalA.get()),
                    ),
                    p(
                      { className: 'mb-2' },
                      span({ className: 'fw-bold text-primary' }, 'signalB: '),
                      span({ className: 'font-monospace' }, signalB.get()),
                    ),
                    p(
                      { className: 'mb-0' },
                      span(
                        { className: 'fw-bold text-success' },
                        'signalC (computed): ',
                      ),
                      span({ className: 'font-monospace' }, computedA.get()),
                    ),
                  ),
                ),
                div(
                  { className: 'col-md-6' },
                  div(
                    { className: 'p-3 bg-light rounded' },
                    p(
                      { className: 'mb-2' },
                      span(
                        { className: 'fw-bold text-warning' },
                        'signalD (preserved): ',
                      ),
                      span({ className: 'font-monospace' }, signalD.get()),
                    ),
                    p(
                      { className: 'mb-2' },
                      span(
                        { className: 'fw-bold text-info' },
                        'regularSignal: ',
                      ),
                      span({ className: 'font-monospace' }, regularSignal),
                    ),
                    p(
                      { className: 'mb-0' },
                      span({ className: 'fw-bold text-secondary' }, 'Note: '),
                      'Signals with keys maintain their values between renders!',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),

      // Advanced usage section
      div(
        { className: 'row mt-4' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2(
                { className: 'card-title h4 mb-4' },
                'Advanced Usage Examples',
              ),
              div(
                { className: 'row g-3' },
                div(
                  { className: 'col-md-4' },
                  div(
                    { className: 'p-3 bg-light rounded' },
                    p(
                      { className: 'mb-2' },
                      span({ className: 'fw-bold' }, 'Direct signal usage: '),
                      span({ className: 'font-monospace' }, signalA),
                    ),
                  ),
                ),
                div(
                  { className: 'col-md-4' },
                  div(
                    { className: 'p-3 bg-light rounded' },
                    p(
                      { className: 'mb-2' },
                      span({ className: 'fw-bold' }, 'Direct computed usage: '),
                      span({ className: 'font-monospace' }, computedA),
                    ),
                  ),
                ),
                div(
                  { className: 'col-md-4' },
                  div(
                    { className: 'p-3 bg-light rounded' },
                    p(
                      { className: 'mb-2' },
                      span({ className: 'fw-bold' }, 'String concatenation: '),
                      span(
                        { className: 'font-monospace' },
                        `Count is ${signalA.get()}, doubled is ${computedA}`,
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
};

// Render the app
render(app, document.getElementById('app')!);
