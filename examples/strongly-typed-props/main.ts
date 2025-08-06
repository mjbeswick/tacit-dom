import {
  div,
  h1,
  h2,
  p,
  span,
  button,
  input,
  textarea,
  select,
  option,
  form,
  label,
  a,
  img,
  video,
  audio,
  canvas,
  table,
  tr,
  td,
  th,
  ul,
  li,
  nav,
  header,
  footer,
  main,
  section,
  article,
  aside,
  details,
  summary,
  dialog,
  menu,
  pre,
  render,
  signal,
  computed,
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
    { className: 'container' },
    h1({}, 'Strongly Typed Props Demo'),

    p(
      {},
      'This example demonstrates the strongly typed props functionality in reactive-dom. All props are now strongly typed based on the HTML element type.',
    ),

    // Form section
    section(
      { className: 'container' },
      h2({}, 'Form with Strongly Typed Props'),

      form(
        {
          onSubmit: handleSubmit,
          action: '#',
          method: 'post',
        },

        // Name input
        div(
          { className: 'form-group' },
          label({ for: 'name' }, 'Name:'),
          input({
            id: 'name',
            type: 'text',
            name: 'name',
            placeholder: 'Enter your name',
            required: true,
            value: name,
            onInput: handleNameChange,
          }),
        ),

        // Email input
        div(
          { className: 'form-group' },
          label({ for: 'email' }, 'Email:'),
          input({
            id: 'email',
            type: 'email',
            name: 'email',
            placeholder: 'Enter your email',
            required: true,
            value: email,
            onInput: handleEmailChange,
          }),
          span(
            {
              className: computed(() =>
                isValidEmail.get() ? 'success' : 'error',
              ),
              style: 'margin-left: 10px;',
            },
            computed(() =>
              isValidEmail.get() ? '✓ Valid email' : '✗ Invalid email',
            ),
          ),
        ),

        // Age input
        div(
          { className: 'form-group' },
          label({ for: 'age' }, 'Age:'),
          input({
            id: 'age',
            type: 'number',
            name: 'age',
            min: 18,
            max: 120,
            value: age,
            onInput: handleAgeChange,
          }),
        ),

        // Country select
        div(
          { className: 'form-group' },
          label({ for: 'country' }, 'Country:'),
          select(
            {
              id: 'country',
              name: 'country',
              value: selectedCountry,
              onChange: handleCountryChange,
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
          { className: 'form-group' },
          label({ for: 'active' }, 'Active:'),
          input({
            id: 'active',
            type: 'checkbox',
            name: 'active',
            checked: isActive,
            onChange: toggleActive,
          }),
          span({}, ' Check this box'),
        ),

        // Rating input
        div(
          { className: 'form-group' },
          label({ for: 'rating' }, 'Rating:'),
          input({
            id: 'rating',
            type: 'range',
            name: 'rating',
            min: 1,
            max: 10,
            value: rating,
            onInput: handleRatingChange,
          }),
          span(
            {},
            computed(() => ` ${rating.get()}/10`),
          ),
        ),

        // Message textarea
        div(
          { className: 'form-group' },
          label({ for: 'message' }, 'Message:'),
          textarea({
            id: 'message',
            name: 'message',
            rows: 4,
            cols: 50,
            placeholder: 'Enter your message',
            value: message,
            onInput: handleMessageChange,
          }),
        ),

        // Submit button
        div(
          { className: 'form-group' },
          button(
            {
              type: 'submit',
              disabled: computed(() => !formStatus.get().valid),
            },
            'Submit Form',
          ),
        ),

        // Status message
        div(
          {
            className: computed(() =>
              formStatus.get().valid ? 'success' : 'error',
            ),
          },
          computed(() => formStatus.get().message),
        ),
      ),
    ),

    // Media elements section
    section(
      { className: 'container' },
      h2({}, 'Media Elements with Strongly Typed Props'),

      div(
        { className: 'form-group' },
        h3({}, 'Image Element'),
        img({
          src: 'https://via.placeholder.com/300x200',
          alt: 'Placeholder image',
          width: 300,
          height: 200,
          loading: 'lazy',
        }),
      ),

      div(
        { className: 'form-group' },
        h3({}, 'Video Element'),
        video(
          {
            src: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            controls: true,
            width: 400,
            height: 225,
            preload: 'metadata',
          },
          'Your browser does not support the video tag.',
        ),
      ),

      div(
        { className: 'form-group' },
        h3({}, 'Audio Element'),
        audio(
          {
            src: 'https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb.mp3',
            controls: true,
            preload: 'metadata',
          },
          'Your browser does not support the audio tag.',
        ),
      ),

      div(
        { className: 'form-group' },
        h3({}, 'Canvas Element'),
        canvas({
          width: 200,
          height: 100,
          style: 'border: 1px solid #ccc;',
        }),
      ),
    ),

    // Table section
    section(
      { className: 'container' },
      h2({}, 'Table with Strongly Typed Props'),

      table(
        {
          border: 1,
          cellpadding: 5,
          cellspacing: 0,
          style: 'border-collapse: collapse; width: 100%;',
        },
        tr({}, th({}, 'Property'), th({}, 'Type'), th({}, 'Description')),
        tr(
          {},
          td({}, 'InputProps'),
          td({}, 'CommonAttributes & InputAttributes & EventHandlers'),
          td({}, 'Strongly typed props for input elements'),
        ),
        tr(
          {},
          td({}, 'ButtonProps'),
          td({}, 'CommonAttributes & FormAttributes & EventHandlers'),
          td({}, 'Strongly typed props for button elements'),
        ),
        tr(
          {},
          td({}, 'AnchorProps'),
          td({}, 'CommonAttributes & AnchorAttributes & EventHandlers'),
          td({}, 'Strongly typed props for anchor elements'),
        ),
        tr(
          {},
          td({}, 'ImageProps'),
          td({}, 'CommonAttributes & ImageAttributes & EventHandlers'),
          td({}, 'Strongly typed props for image elements'),
        ),
      ),
    ),

    // Navigation section
    section(
      { className: 'container' },
      h2({}, 'Navigation with Strongly Typed Props'),

      nav(
        {},
        ul(
          {},
          li(
            {},
            a(
              {
                href: '#',
                target: '_blank',
                rel: 'noopener noreferrer',
              },
              'Home',
            ),
          ),
          li(
            {},
            a(
              {
                href: '#about',
                download: 'about.html',
              },
              'About',
            ),
          ),
          li(
            {},
            a(
              {
                href: '#contact',
                hreflang: 'en',
              },
              'Contact',
            ),
          ),
        ),
      ),
    ),

    // Interactive elements
    section(
      { className: 'container' },
      h2({}, 'Interactive Elements'),

      div(
        { className: 'form-group' },
        details(
          {
            open: isActive,
          },
          summary({}, 'Click to expand details'),
          p(
            {},
            'This is a details element with strongly typed props. The open attribute is reactive.',
          ),
        ),
      ),

      div(
        { className: 'form-group' },
        dialog(
          {
            open: false,
          },
          h3({}, 'Dialog Title'),
          p({}, 'This is a dialog element with strongly typed props.'),
          button(
            {
              onClick: () => console.log('Dialog button clicked'),
            },
            'Close',
          ),
        ),
      ),

      div(
        { className: 'form-group' },
        menu(
          {
            type: 'context',
          },
          li({}, 'Context menu item 1'),
          li({}, 'Context menu item 2'),
          li({}, 'Context menu item 3'),
        ),
      ),
    ),

    // Code example
    section(
      { className: 'container' },
      h2({}, 'Code Example'),

      pre(
        {
          style: 'background: #f4f4f4; padding: 10px; border-radius: 3px;',
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
  );
}

// Render the app
const appContainer = document.getElementById('app');
if (appContainer) {
  render(createApp, appContainer);
}
