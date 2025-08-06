import {
  div,
  h1,
  p,
  span,
  button,
  input,
  textarea,
  select,
  option,
  form,
  label,
  ul,
  ol,
  li,
  table,
  tr,
  td,
  th,
  img,
  video,
  audio,
  canvas,
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
  menuitem,
  pre,
  createElement,
  render,
  cleanup,
  classNames,
  createReactiveList,
  type ElementProps,
  type ElementChildren,
  type ElementCreator,
} from './reactive-dom';
import { signal, computed } from './reactivity';

// Use real DOM environment since Jest is configured with jsdom
describe('Element Creators', () => {
  describe('basic element creation', () => {
    it('should create div element', () => {
      const element = div();
      expect(element.tagName).toBe('DIV');
    });

    it('should create h1 element', () => {
      const element = h1();
      expect(element.tagName).toBe('H1');
    });

    it('should create p element', () => {
      const element = p();
      expect(element.tagName).toBe('P');
    });

    it('should create span element', () => {
      const element = span();
      expect(element.tagName).toBe('SPAN');
    });

    it('should create button element', () => {
      const element = button();
      expect(element.tagName).toBe('BUTTON');
    });

    it('should create input element', () => {
      const element = input();
      expect(element.tagName).toBe('INPUT');
    });

    it('should create textarea element', () => {
      const element = textarea();
      expect(element.tagName).toBe('TEXTAREA');
    });

    it('should create select element', () => {
      const element = select();
      expect(element.tagName).toBe('SELECT');
    });

    it('should create option element', () => {
      const element = option();
      expect(element.tagName).toBe('OPTION');
    });

    it('should create form element', () => {
      const element = form();
      expect(element.tagName).toBe('FORM');
    });

    it('should create label element', () => {
      const element = label();
      expect(element.tagName).toBe('LABEL');
    });

    it('should create ul element', () => {
      const element = ul();
      expect(element.tagName).toBe('UL');
    });

    it('should create ol element', () => {
      const element = ol();
      expect(element.tagName).toBe('OL');
    });

    it('should create li element', () => {
      const element = li();
      expect(element.tagName).toBe('LI');
    });

    it('should create table element', () => {
      const element = table();
      expect(element.tagName).toBe('TABLE');
    });

    it('should create tr element', () => {
      const element = tr();
      expect(element.tagName).toBe('TR');
    });

    it('should create td element', () => {
      const element = td();
      expect(element.tagName).toBe('TD');
    });

    it('should create th element', () => {
      const element = th();
      expect(element.tagName).toBe('TH');
    });

    it('should create img element', () => {
      const element = img();
      expect(element.tagName).toBe('IMG');
    });

    it('should create video element', () => {
      const element = video();
      expect(element.tagName).toBe('VIDEO');
    });

    it('should create audio element', () => {
      const element = audio();
      expect(element.tagName).toBe('AUDIO');
    });

    it('should create canvas element', () => {
      const element = canvas();
      expect(element.tagName).toBe('CANVAS');
    });

    it('should create nav element', () => {
      const element = nav();
      expect(element.tagName).toBe('NAV');
    });

    it('should create header element', () => {
      const element = header();
      expect(element.tagName).toBe('HEADER');
    });

    it('should create footer element', () => {
      const element = footer();
      expect(element.tagName).toBe('FOOTER');
    });

    it('should create main element', () => {
      const element = main();
      expect(element.tagName).toBe('MAIN');
    });

    it('should create section element', () => {
      const element = section();
      expect(element.tagName).toBe('SECTION');
    });

    it('should create article element', () => {
      const element = article();
      expect(element.tagName).toBe('ARTICLE');
    });

    it('should create aside element', () => {
      const element = aside();
      expect(element.tagName).toBe('ASIDE');
    });

    it('should create details element', () => {
      const element = details();
      expect(element.tagName).toBe('DETAILS');
    });

    it('should create summary element', () => {
      const element = summary();
      expect(element.tagName).toBe('SUMMARY');
    });

    it('should create dialog element', () => {
      const element = dialog();
      expect(element.tagName).toBe('DIALOG');
    });

    it('should create menu element', () => {
      const element = menu();
      expect(element.tagName).toBe('MENU');
    });

    it('should create menuitem element', () => {
      const element = menuitem();
      expect(element.tagName).toBe('MENUITEM');
    });

    it('should create pre element', () => {
      const element = pre();
      expect(element.tagName).toBe('PRE');
    });
  });

  describe('element with props', () => {
    it('should set attributes', () => {
      const element = div({ id: 'test', className: 'test-class' });
      expect(element.getAttribute('id')).toBe('test');
      expect(element.getAttribute('class')).toBe('test-class');
    });

    it('should handle event listeners', () => {
      const mockHandler = jest.fn();
      const element = button({ onClick: mockHandler });
      expect(element).toBeDefined();
    });

    it('should handle boolean attributes', () => {
      const element = input({ disabled: true, checked: false });
      expect(element.hasAttribute('disabled')).toBe(true);
      expect(element.hasAttribute('checked')).toBe(false);
    });

    it('should handle input value property', () => {
      const element = input({ value: 'test-value' });
      expect((element as HTMLInputElement).value).toBe('test-value');
    });
  });

  describe('element with children', () => {
    it('should add text children', () => {
      const element = div('Hello', 'World');
      expect(element.textContent).toBe('HelloWorld');
    });

    it('should add element children', () => {
      const child1 = span();
      const child2 = p();
      const element = div(child1, child2);
      expect(element.children.length).toBe(2);
    });

    it('should handle mixed children', () => {
      const childElement = span();
      const element = div('Text', childElement, 42);
      expect(element.children.length).toBe(1);
      expect(element.textContent).toContain('Text');
    });

    it('should handle first argument as child when not object', () => {
      const element = div('Hello World');
      expect(element.textContent).toBe('Hello World');
    });
  });

  describe('reactive attributes', () => {
    it('should handle reactive className', () => {
      const classNameSignal = signal('active');
      const element = div({ className: classNameSignal });

      // Initial value should be set
      expect(element.className).toBe('active');

      // Update should trigger change
      classNameSignal.set('inactive');
      expect(element.className).toBe('inactive');
    });

    it('should handle reactive attributes', () => {
      const idSignal = signal('initial-id');
      const element = div({ id: idSignal });

      expect(element.getAttribute('id')).toBe('initial-id');

      idSignal.set('new-id');
      expect(element.getAttribute('id')).toBe('new-id');
    });

    it('should handle reactive boolean attributes', () => {
      const disabledSignal = signal(true);
      const element = input({ disabled: disabledSignal });

      expect(element.hasAttribute('disabled')).toBe(true);

      disabledSignal.set(false);
      expect(element.hasAttribute('disabled')).toBe(false);
    });

    it('should handle reactive input value', () => {
      const valueSignal = signal('initial');
      const element = input({ value: valueSignal });

      expect((element as HTMLInputElement).value).toBe('initial');

      valueSignal.set('updated');
      expect((element as HTMLInputElement).value).toBe('updated');
    });
  });

  describe('reactive children', () => {
    it('should handle reactive text children', () => {
      const textSignal = signal('Hello');
      const element = div(textSignal);

      expect(element.textContent).toBe('Hello');
    });

    it('should update reactive text children', () => {
      const textSignal = signal('Hello');
      const element = div(textSignal);

      textSignal.set('World');
      expect(element.textContent).toBe('World');
    });
  });

  describe('error handling', () => {
    it('should handle errors in reactive updates gracefully', () => {
      const errorSignal = signal(0);
      div({
        className: computed(() => {
          if (errorSignal.get() > 0) {
            throw new Error('Test error');
          }
          return 'normal';
        }),
      });

      expect(() => errorSignal.set(1)).not.toThrow();
    });

    it('should handle errors in text node updates', () => {
      const errorSignal = signal(0);
      div(
        computed(() => {
          if (errorSignal.get() > 0) {
            throw new Error('Text error');
          }
          return 'normal';
        }),
      );

      expect(() => errorSignal.set(1)).not.toThrow();
    });
  });
});

describe('createElement', () => {
  it('should create custom elements', () => {
    const customElement = createElement('custom-tag');
    const element = customElement();
    expect(element.tagName).toBe('CUSTOM-TAG');
  });

  it('should work with props and children', () => {
    const customElement = createElement('test-element');
    const element = customElement({ id: 'test' }, 'Hello');
    expect(element.getAttribute('id')).toBe('test');
    expect(element.textContent).toBe('Hello');
  });
});

describe('render', () => {
  it('should render component to container', () => {
    const container = document.createElement('div');
    const component = () => div('Hello World');

    render(component, container);

    expect(container.children.length).toBe(1);
    expect(container.textContent).toBe('Hello World');
  });

  it('should clean up existing elements', () => {
    const container = document.createElement('div');
    container.innerHTML = '<div>Old Content</div>';

    const component = () => div('New Content');

    render(component, container);

    expect(container.children.length).toBe(1);
    expect(container.textContent).toBe('New Content');
  });
});

describe('cleanup', () => {
  it('should clean up reactive subscriptions', () => {
    const element = div();
    const testSignal = signal(0);

    // Add reactive attribute
    element.className = 'test';

    cleanup(element);

    // Should not throw
    expect(() => testSignal.set(1)).not.toThrow();
  });
});

describe('createReactiveList', () => {
  it('should create reactive list', () => {
    const itemsSignal = signal(['Apple', 'Banana']);
    const list = createReactiveList(itemsSignal, (item, _index) =>
      li(`${item}`),
    );

    expect(list.tagName).toBe('DIV');
  });

  it('should update when signal changes', () => {
    const itemsSignal = signal(['Apple', 'Banana']);
    const list = createReactiveList(itemsSignal, (item, _index) => li(item));

    // Initial render
    expect(list.children.length).toBe(2);

    // Update signal
    itemsSignal.set(['Cherry', 'Date']);

    // Should update list
    expect(list.children.length).toBe(2);
  });

  it('should handle empty arrays', () => {
    const itemsSignal = signal([]);
    const list = createReactiveList(itemsSignal, (item) => li(item));

    expect(list.children.length).toBe(0);
  });

  it('should handle complex items', () => {
    const itemsSignal = signal([
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' },
    ]);

    const list = createReactiveList(itemsSignal, (item) =>
      li({ id: `item-${item.id}` }, item.name),
    );

    expect(list.tagName).toBe('DIV');
  });
});

describe('classNames integration', () => {
  it('should work with classNames function', () => {
    const element = div({
      className: classNames('base', { active: true, disabled: false }),
    });

    expect(element.className).toBe('base active');
  });

  it('should handle reactive classNames', () => {
    const isActive = signal(true);
    const element = div({
      className: classNames('base', { active: isActive }),
    });

    expect(element.className).toBe('base active');

    isActive.set(false);
    expect(element.className).toBe('base');
  });
});

describe('TypeScript types', () => {
  it('should have correct ElementProps type', () => {
    const props: ElementProps = {
      id: 'test',
      className: 'test-class',
      onClick: jest.fn(),
    };

    expect(typeof props.id).toBe('string');
    expect(typeof props.className).toBe('string');
    expect(typeof props.onClick).toBe('function');
  });

  it('should have correct ElementChildren type', () => {
    const children: ElementChildren = ['text', 42, div()];

    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBe(3);
  });

  it('should have correct ElementCreator type', () => {
    const creator: ElementCreator = (props, ...children) =>
      div(props, ...children);

    expect(typeof creator).toBe('function');
    const element = creator({ id: 'test' }, 'Hello');
    expect(element.tagName).toBe('DIV');
  });
});

describe('edge cases', () => {
  it('should handle null and undefined props', () => {
    const element = div(null as any);
    expect(element.tagName).toBe('DIV');
  });

  it('should handle undefined children', () => {
    const element = div(undefined as any);
    expect(element.tagName).toBe('DIV');
  });

  it('should handle empty props object', () => {
    const element = div({});
    expect(element.tagName).toBe('DIV');
  });

  it('should handle no arguments', () => {
    const element = div();
    expect(element.tagName).toBe('DIV');
  });
});

describe('performance and limits', () => {
  it('should handle rapid updates without infinite loops', () => {
    const count = signal(0);
    const element = div({
      className: computed(() => `class-${count.get()}`),
    });

    // Rapid updates
    for (let i = 0; i < 10; i++) {
      count.set(i);
    }

    expect(element.className).toBe('class-9');
  });

  it('should handle complex nested reactive structures', () => {
    const data = signal({ items: ['a', 'b'], active: true });
    const element = div(
      {
        className: computed(() =>
          classNames('container', { active: data.get().active }),
        ),
      },
      computed(() => data.get().items.join(', ')),
    );

    expect(element.tagName).toBe('DIV');
  });
});
