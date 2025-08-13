import {
  a,
  audio,
  button,
  computed,
  details,
  dialog,
  div,
  form,
  h1,
  h2,
  h3,
  img,
  input,
  label,
  li,
  menu,
  nav,
  option,
  p,
  pre,
  render,
  select,
  signal,
  span,
  summary,
  table,
  td,
  textarea,
  th,
  tr,
  ul,
  video,
} from '../../src/index';

// Create reactive signals for form data
const name = signal('');
const email = signal('');
const age = signal(25);
const isActive = signal(false);
const selectedCountry = signal('us');
const message = signal('');
const rating = signal(5);

// Computed values
const isValidEmail = computed(() => {
  const emailValue = email.get();
  return emailValue.includes('@') && emailValue.includes('.');
});

const formStatus = computed(() => {
  const nameValue = name.get();
  const emailValue = email.get();
  const ageValue = age.get();

  if (!nameValue || !emailValue || ageValue < 18) {
    return {
      valid: false,
      message: 'Please fill all fields and ensure age is 18+',
    };
  }
  return { valid: true, message: 'Form is valid!' };
});

const countries = [
  { code: 'us', name: 'United States' },
  { code: 'ca', name: 'Canada' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
];

// Event handlers
const handleNameChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  name.set(target.value);
};

const handleEmailChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  email.set(target.value);
};

const handleAgeChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  age.set(parseInt(target.value) || 0);
};

const handleCountryChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selectedCountry.set(target.value);
};

const handleMessageChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  message.set(target.value);
};

const handleRatingChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  rating.set(parseInt(target.value) || 0);
};

const toggleActive = () => {
  isActive.set(!isActive.get());
};

const handleSubmit = (event: Event) => {
  event.preventDefault();
  alert('Form submitted! Check console for data.');
  console.log('Form Data:', {
    name: name.get(),
    email: email.get(),
    age: age.get(),
    isActive: isActive.get(),
    country: selectedCountry.get(),
    message: message.get(),
    rating: rating.get(),
  });
};

// Create the main app component
function createApp() {
  return div(
    { className: 'min-vh-100 d-flex flex-column' },

    // Header section
    div(
      { className: 'bg-info text-white py-5 flex-shrink-0' },
      div(
        { className: 'container' },
        div(
          { className: 'row justify-content-center' },
          div(
            { className: 'col-lg-8 text-center' },
            h1({ className: 'display-4 mb-3' }, 'Strongly Typed Props Demo'),
            p(
              { className: 'lead mb-0' },
              'This example demonstrates the strongly typed props functionality in reactive-dom. All props are now strongly typed based on the HTML element type.',
            ),
          ),
        ),
      ),
    ),

    // Main content - flexible and growing
    div(
      { className: 'container flex-grow-1 py-4' },

      // Form section
      div(
        { className: 'row mb-5' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2(
                { className: 'card-title h3 mb-4' },
                'Form with Strongly Typed Props',
              ),

              form(
                {
                  onSubmit: handleSubmit,
                  action: '#',
                  method: 'post',
                },

                // Name input
                div(
                  { className: 'mb-3' },
                  label({ for: 'name', className: 'form-label' }, 'Name:'),
                  input({
                    id: 'name',
                    type: 'text',
                    name: 'name',
                    placeholder: 'Enter your name',
                    required: true,
                    value: name,
                    onInput: handleNameChange,
                    className: 'form-control',
                  }),
                ),

                // Email input
                div(
                  { className: 'mb-3' },
                  label({ for: 'email', className: 'form-label' }, 'Email:'),
                  input({
                    id: 'email',
                    type: 'email',
                    name: 'email',
                    placeholder: 'Enter your email',
                    required: true,
                    value: email,
                    onInput: handleEmailChange,
                    className: 'form-control',
                  }),
                  div(
                    { className: 'mt-1' },
                    span(
                      {
                        className: computed(() =>
                          isValidEmail.get() ? 'text-success' : 'text-danger',
                        ),
                      },
                      computed(() =>
                        isValidEmail.get()
                          ? '✓ Valid email'
                          : '✗ Invalid email',
                      ),
                    ),
                  ),
                ),

                // Age input
                div(
                  { className: 'mb-3' },
                  label({ for: 'age', className: 'form-label' }, 'Age:'),
                  input({
                    id: 'age',
                    type: 'number',
                    name: 'age',
                    min: 18,
                    max: 120,
                    value: age,
                    onInput: handleAgeChange,
                    className: 'form-control',
                  }),
                ),

                // Country select
                div(
                  { className: 'mb-3' },
                  label(
                    { for: 'country', className: 'form-label' },
                    'Country:',
                  ),
                  select(
                    {
                      id: 'country',
                      name: 'country',
                      value: selectedCountry,
                      onChange: handleCountryChange,
                      className: 'form-control',
                    },
                    ...countries.map((country) =>
                      option(
                        {
                          value: country.code,
                          selected: computed(
                            () => selectedCountry.get() === country.code,
                          ),
                        },
                        country.name,
                      ),
                    ),
                  ),
                ),

                // Active checkbox
                div(
                  { className: 'mb-3' },
                  label(
                    { for: 'active', className: 'form-check-label' },
                    'Active:',
                  ),
                  input({
                    id: 'active',
                    type: 'checkbox',
                    name: 'active',
                    checked: isActive,
                    onChange: toggleActive,
                    className: 'form-check-input',
                  }),
                  span(' Check this box'),
                ),

                // Rating input
                div(
                  { className: 'mb-3' },
                  label({ for: 'rating', className: 'form-label' }, 'Rating:'),
                  input({
                    id: 'rating',
                    type: 'range',
                    name: 'rating',
                    min: 1,
                    max: 10,
                    value: rating,
                    onInput: handleRatingChange,
                    className: 'form-range',
                  }),
                  span(computed(() => ` ${rating.get()}/10`)),
                ),

                // Message textarea
                div(
                  { className: 'mb-3' },
                  label(
                    { for: 'message', className: 'form-label' },
                    'Message:',
                  ),
                  textarea({
                    id: 'message',
                    name: 'message',
                    rows: 4,
                    cols: 50,
                    placeholder: 'Enter your message',
                    value: message,
                    onInput: handleMessageChange,
                    className: 'form-control',
                  }),
                ),

                // Submit button
                div(
                  { className: 'mb-3' },
                  button(
                    {
                      type: 'submit',
                      disabled: computed(() => !formStatus.get().valid),
                      className: 'btn btn-primary',
                    },
                    'Submit Form',
                  ),
                ),

                // Status message
                div(
                  {
                    className: computed(() =>
                      formStatus.get().valid
                        ? 'alert alert-success'
                        : 'alert alert-danger',
                    ),
                  },
                  computed(() => formStatus.get().message),
                ),
              ),
            ),
          ),
        ),
      ),

      // Media elements section
      div(
        { className: 'row mb-5' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2(
                { className: 'card-title h3 mb-4' },
                'Media Elements with Strongly Typed Props',
              ),

              div(
                { className: 'row g-3' },
                div(
                  { className: 'col-md-4' },
                  div(
                    { className: 'card shadow-sm' },
                    div(
                      { className: 'card-body' },
                      h3('Image Element'),
                      img({
                        src: 'https://via.placeholder.com/300x200',
                        alt: 'Placeholder image',
                        width: 300,
                        height: 200,
                        loading: 'lazy',
                        className: 'img-fluid',
                      }),
                    ),
                  ),
                ),
                div(
                  { className: 'col-md-4' },
                  div(
                    { className: 'card shadow-sm' },
                    div(
                      { className: 'card-body' },
                      h3('Video Element'),
                      video(
                        {
                          src: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                          controls: true,
                          width: 400,
                          height: 225,
                          preload: 'metadata',
                          className: 'img-fluid',
                        },
                        'Your browser does not support the video tag.',
                      ),
                    ),
                  ),
                ),
                div(
                  { className: 'col-md-4' },
                  div(
                    { className: 'card shadow-sm' },
                    div(
                      { className: 'card-body' },
                      h3('Audio Element'),
                      audio(
                        {
                          src: 'https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb.mp3',
                          controls: true,
                          preload: 'metadata',
                          className: 'img-fluid',
                        },
                        'Your browser does not support the audio tag.',
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),

      // Table section
      div(
        { className: 'row mb-5' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2(
                { className: 'card-title h3 mb-4' },
                'Table with Strongly Typed Props',
              ),

              table(
                {
                  border: 1,
                  cellpadding: 5,
                  cellspacing: 0,
                  style: 'border-collapse: collapse; width: 100%;',
                  className: 'table table-bordered table-striped',
                },
                tr(th('Property'), th('Type'), th('Description')),
                tr(
                  td('InputProps'),
                  td('CommonAttributes & InputAttributes & EventHandlers'),
                  td('Strongly typed props for input elements'),
                ),
                tr(
                  td('ButtonProps'),
                  td('CommonAttributes & FormAttributes & EventHandlers'),
                  td('Strongly typed props for button elements'),
                ),
                tr(
                  td('AnchorProps'),
                  td('CommonAttributes & AnchorAttributes & EventHandlers'),
                  td('Strongly typed props for anchor elements'),
                ),
                tr(
                  td('ImageProps'),
                  td('CommonAttributes & ImageAttributes & EventHandlers'),
                  td('Strongly typed props for image elements'),
                ),
              ),
            ),
          ),
        ),
      ),

      // Navigation section
      div(
        { className: 'row mb-5' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2(
                { className: 'card-title h3 mb-4' },
                'Navigation with Strongly Typed Props',
              ),

              nav(
                ul(
                  li(
                    a(
                      {
                        href: '#',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'nav-link',
                      },
                      'Home',
                    ),
                  ),
                  li(
                    a(
                      {
                        href: '#about',
                        download: 'about.html',
                        className: 'nav-link',
                      },
                      'About',
                    ),
                  ),
                  li(
                    a(
                      {
                        href: '#contact',
                        hreflang: 'en',
                        className: 'nav-link',
                      },
                      'Contact',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),

      // Interactive elements
      div(
        { className: 'row mb-5' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2({ className: 'card-title h3 mb-4' }, 'Interactive Elements'),

              div(
                { className: 'row g-3' },
                div(
                  { className: 'col-md-4' },
                  details(
                    {
                      open: isActive,
                      className: 'mb-3',
                    },
                    summary('Click to expand details', { className: 'h5' }),
                    p(
                      'This is a details element with strongly typed props. The open attribute is reactive.',
                      { className: 'card-text' },
                    ),
                  ),
                ),
                div(
                  { className: 'col-md-4' },
                  dialog(
                    {
                      open: false,
                      className: 'mb-3',
                    },
                    h3('Dialog Title', { className: 'h5' }),
                    p('This is a dialog element with strongly typed props.', {
                      className: 'card-text',
                    }),
                    button(
                      {
                        onClick: () => console.log('Dialog button clicked'),
                        className: 'btn btn-secondary',
                      },
                      'Close',
                    ),
                  ),
                ),
                div(
                  { className: 'col-md-4' },
                  menu(
                    {
                      type: 'context',
                      className: 'mb-3',
                    },
                    li('Context menu item 1', { className: 'nav-link' }),
                    li('Context menu item 2', { className: 'nav-link' }),
                    li('Context menu item 3', { className: 'nav-link' }),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),

      // Code example
      div(
        { className: 'row mb-5' },
        div(
          { className: 'col-12' },
          div(
            { className: 'card shadow-sm' },
            div(
              { className: 'card-body' },
              h2({ className: 'card-title h3 mb-4' }, 'Code Example'),

              pre(
                {
                  style:
                    'background: #f4f4f4; padding: 10px; border-radius: 3px;',
                  className: 'card-text',
                },
                `
// Strongly typed input props
const inputElement = input({
  type: 'email',
  placeholder: 'Enter email',
  required: true,
  value: emailSignal,
  onInput: handleEmailChange
});

// Strongly typed button props
const buttonElement = button({
  type: 'submit',
  disabled: isDisabledSignal,
  onClick: handleClick
}, 'Submit');

// Strongly typed anchor props
const linkElement = a({
  href: 'https://example.com',
  target: '_blank',
  rel: 'noopener noreferrer'
}, 'External Link');
      `,
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// Render the app
const appContainer = document.getElementById('app');
if (appContainer) {
  render(createApp, appContainer);
}
