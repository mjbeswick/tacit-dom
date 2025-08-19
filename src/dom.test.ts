/**
 * @fileoverview Tests for DOM manipulation utilities
 */

// Add missing global polyfills for JSDOM
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

import { JSDOM } from 'jsdom';
import {
  a,
  article,
  aside,
  audio,
  button,
  cleanup,
  createElement,
  createReactiveComponent,
  createReactiveList,
  details,
  dialog,
  div,
  footer,
  form,
  h1,
  h2,
  header,
  hr,
  img,
  input,
  li,
  main,
  menu,
  nav,
  p,
  render,
  section,
  span,
  summary,
  table,
  td,
  template,
  th,
  tr,
  ul,
  video,
} from './dom';
import { computed, signal } from './signals';

// Helper function to create events for JSDOM compatibility
function createEvent(type: string): Event {
  const event = document.createEvent('Event');
  event.initEvent(type, true, true);
  return event;
}

// Set up JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
});

global.document = dom.window.document;
global.window = dom.window as any;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLInputElement = dom.window.HTMLInputElement;
global.HTMLButtonElement = dom.window.HTMLButtonElement;
global.HTMLAnchorElement = dom.window.HTMLAnchorElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.HTMLFormElement = dom.window.HTMLFormElement;
global.HTMLSelectElement = dom.window.HTMLSelectElement;
global.HTMLOptionElement = dom.window.HTMLOptionElement;
global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
global.HTMLTableElement = dom.window.HTMLTableElement;
global.HTMLTableRowElement = dom.window.HTMLTableRowElement;
global.HTMLTableCellElement = dom.window.HTMLTableCellElement;
global.HTMLTableHeaderCellElement = dom.window.HTMLTableHeaderCellElement;
global.HTMLUListElement = dom.window.HTMLUListElement;
global.HTMLOListElement = dom.window.HTMLOListElement;
global.HTMLLIElement = dom.window.HTMLLIElement;
global.HTMLLabelElement = dom.window.HTMLLabelElement;
global.HTMLDivElement = dom.window.HTMLDivElement;
global.HTMLHeadingElement = dom.window.HTMLHeadingElement;
global.HTMLParagraphElement = dom.window.HTMLParagraphElement;
global.HTMLSpanElement = dom.window.HTMLSpanElement;
global.HTMLVideoElement = dom.window.HTMLVideoElement;
global.HTMLAudioElement = dom.window.HTMLAudioElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.HTMLNavElement = dom.window.HTMLNavElement;
global.HTMLHeaderElement = dom.window.HTMLHeaderElement;
global.HTMLFooterElement = dom.window.HTMLFooterElement;
global.HTMLMainElement = dom.window.HTMLMainElement;
global.HTMLSectionElement = dom.window.HTMLSectionElement;
global.HTMLArticleElement = dom.window.HTMLArticleElement;
global.HTMLAsideElement = dom.window.HTMLAsideElement;
global.HTMLDetailsElement = dom.window.HTMLDetailsElement;
global.HTMLSummaryElement = dom.window.HTMLSummaryElement;
global.HTMLDialogElement = dom.window.HTMLDialogElement;
global.HTMLMenuElement = dom.window.HTMLMenuElement;
global.HTMLMenuItemElement = dom.window.HTMLMenuItemElement;
global.HTMLPreElement = dom.window.HTMLPreElement;
global.Text = dom.window.Text;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.FocusEvent = dom.window.FocusEvent;
global.ClipboardEvent = dom.window.ClipboardEvent;
global.DragEvent = dom.window.DragEvent;
global.UIEvent = dom.window.UIEvent;
global.WheelEvent = dom.window.WheelEvent;

describe('DOM Element Creation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup(document.body);
  });

  describe('Basic Element Creation', () => {
    it('should create div element with no props', () => {
      const element = div();
      expect(element.tagName).toBe('DIV');
      expect(element.children.length).toBe(0);
    });

    it('should create div element with string children', () => {
      const element = div('Hello', 'World');
      expect(element.tagName).toBe('DIV');
      expect(element.textContent).toBe('HelloWorld');
      expect(element.children.length).toBe(0);
      expect(element.childNodes.length).toBe(2);
    });

    it('should create div element with mixed children', () => {
      const spanElement = span('Span text');
      const element = div('Text', spanElement, 42);
      expect(element.tagName).toBe('DIV');
      expect(element.children.length).toBe(1);
      expect(element.childNodes.length).toBe(3);
      expect(element.children[0]).toBe(spanElement);
    });

    it('should create heading elements', () => {
      const h1Element = h1('Title');
      const h2Element = h2('Subtitle');

      expect(h1Element.tagName).toBe('H1');
      expect(h2Element.tagName).toBe('H2');
      expect(h1Element.textContent).toBe('Title');
      expect(h2Element.textContent).toBe('Subtitle');
    });

    it('should create paragraph and span elements', () => {
      const pElement = p('Paragraph text');
      const spanElement = span('Span text');

      expect(pElement.tagName).toBe('P');
      expect(spanElement.tagName).toBe('SPAN');
      expect(pElement.textContent).toBe('Paragraph text');
      expect(spanElement.textContent).toBe('Span text');
    });

    it('should create hr element', () => {
      const hrElement = hr();
      expect(hrElement.tagName).toBe('HR');
      expect(hrElement.children.length).toBe(0);
    });

    it('should create form elements', () => {
      const inputElement = input({ type: 'text', placeholder: 'Enter text' });
      const buttonElement = button('Submit');
      const formElement = form(
        { action: '/submit' },
        inputElement,
        buttonElement,
      );

      expect(inputElement.tagName).toBe('INPUT');
      expect(buttonElement.tagName).toBe('BUTTON');
      expect(formElement.tagName).toBe('FORM');
      expect(inputElement.getAttribute('type')).toBe('text');
      expect(inputElement.getAttribute('placeholder')).toBe('Enter text');
      expect(buttonElement.textContent).toBe('Submit');
      expect(formElement.getAttribute('action')).toBe('/submit');
    });

    it('should create list elements', () => {
      const listItem1 = li('Item 1');
      const listItem2 = li('Item 2');
      const ulElement = ul({ className: 'list' }, listItem1, listItem2);

      expect(ulElement.tagName).toBe('UL');
      expect(ulElement.className).toBe('list');
      expect(ulElement.children.length).toBe(2);
      expect(ulElement.children[0]).toBe(listItem1);
      expect(ulElement.children[1]).toBe(listItem2);
    });

    it('should create table elements', () => {
      const headerCell = th('Header');
      const dataCell = td('Data');
      const row = tr(headerCell, dataCell);
      const tableElement = table({ border: '1' }, row);

      expect(tableElement.tagName).toBe('TABLE');
      expect(row.tagName).toBe('TR');
      expect(headerCell.tagName).toBe('TH');
      expect(dataCell.tagName).toBe('TD');
      expect(tableElement.getAttribute('border')).toBe('1');
      expect(headerCell.textContent).toBe('Header');
      expect(dataCell.textContent).toBe('Data');
    });

    it('should create media elements', () => {
      const imgElement = img({ src: 'image.jpg', alt: 'Image' });
      const videoElement = video({ src: 'video.mp4', controls: true });
      const audioElement = audio({ src: 'audio.mp3', autoplay: false });

      expect(imgElement.tagName).toBe('IMG');
      expect(videoElement.tagName).toBe('VIDEO');
      expect(audioElement.tagName).toBe('AUDIO');
      expect(imgElement.getAttribute('src')).toBe('image.jpg');
      expect(imgElement.getAttribute('alt')).toBe('Image');
      expect(videoElement.getAttribute('controls')).toBe('');
      expect(audioElement.hasAttribute('autoplay')).toBe(false);
    });

    it('should create semantic elements', () => {
      const navElement = nav({ className: 'navigation' });
      const headerElement = header('Page Header');
      const footerElement = footer('Page Footer');
      const mainElement = main('Main Content');
      const sectionElement = section('Section');
      const articleElement = article('Article');
      const asideElement = aside('Sidebar');

      expect(navElement.tagName).toBe('NAV');
      expect(headerElement.tagName).toBe('HEADER');
      expect(footerElement.tagName).toBe('FOOTER');
      expect(mainElement.tagName).toBe('MAIN');
      expect(sectionElement.tagName).toBe('SECTION');
      expect(articleElement.tagName).toBe('ARTICLE');
      expect(asideElement.tagName).toBe('ASIDE');
      expect(navElement.className).toBe('navigation');
    });

    it('should create interactive elements', () => {
      const detailsElement = details({ open: true });
      const summaryElement = summary('Summary');
      const dialogElement = dialog({ open: false });
      const menuElement = menu({ type: 'context' });

      expect(detailsElement.tagName).toBe('DETAILS');
      expect(summaryElement.tagName).toBe('SUMMARY');
      expect(dialogElement.tagName).toBe('DIALOG');
      expect(menuElement.tagName).toBe('MENU');
      expect(detailsElement.getAttribute('open')).toBe('');
      expect(dialogElement.hasAttribute('open')).toBe(false);
      expect(menuElement.getAttribute('type')).toBe('context');
    });
  });

  describe('Element Props and Attributes', () => {
    it('should handle common attributes', () => {
      const element = div({
        id: 'test-id',
        className: 'test-class',
        style: 'color: red;',
        title: 'Test title',
        lang: 'en',
        dir: 'ltr',
        hidden: true,
        tabIndex: 1,
        accessKey: 't',
        contentEditable: true,
        spellcheck: true,
        draggable: true,
      });

      expect(element.id).toBe('test-id');
      expect(element.className).toBe('test-class');
      expect(element.style.cssText).toBe('color: red;');
      expect(element.title).toBe('Test title');
      expect(element.lang).toBe('en');
      expect(element.dir).toBe('ltr');
      expect(element.hidden).toBe(true);
      expect(element.tabIndex).toBe(1);
      expect(element.accessKey).toBe('t');
      expect(element.contentEditable).toBe('true');
      expect(element.spellcheck).toBe(true);
      expect(element.draggable).toBe('true');
    });

    it('should handle boolean attributes correctly', () => {
      const inputElement = input({
        disabled: true,
        checked: true,
        readonly: true,
        required: true,
      }) as HTMLInputElement;

      expect(inputElement.hasAttribute('disabled')).toBe(true);
      expect(inputElement.hasAttribute('checked')).toBe(true);
      expect(inputElement.hasAttribute('readonly')).toBe(true);
      expect(inputElement.hasAttribute('required')).toBe(true);
      expect(inputElement.disabled).toBe(true);
      expect(inputElement.checked).toBe(true);
      expect(inputElement.readOnly).toBe(true);
      expect(inputElement.required).toBe(true);
    });

    it('should handle form attributes', () => {
      const inputElement = input({
        name: 'username',
        value: 'john_doe',
        autoComplete: 'on',
        autoFocus: true,
        form: 'login-form',
        formAction: '/login',
        formEnctype: 'application/x-www-form-urlencoded',
        formMethod: 'post',
        formNoValidate: true,
        formTarget: '_blank',
      }) as HTMLInputElement;

      expect(inputElement.name).toBe('username');
      expect(inputElement.value).toBe('john_doe');
      expect(inputElement.getAttribute('autocomplete')).toBe('on');
      expect(inputElement.getAttribute('autofocus')).toBe('');
      expect(inputElement.getAttribute('form')).toBe('login-form');
      expect(inputElement.getAttribute('formaction')).toBe('/login');
      expect(inputElement.getAttribute('formenctype')).toBe(
        'application/x-www-form-urlencoded',
      );
      expect(inputElement.getAttribute('formmethod')).toBe('post');
      expect(inputElement.getAttribute('formnovalidate')).toBe('');
      expect(inputElement.getAttribute('formtarget')).toBe('_blank');
    });

    it('should handle input-specific attributes', () => {
      const inputElement = input({
        type: 'email',
        placeholder: 'Enter email',
        size: 30,
        maxLength: 100,
        minLength: 5,
        pattern: '[a-z]+',
        min: '0',
        max: '100',
        step: '1',
        multiple: true,
        accept: '.jpg,.png',
      }) as HTMLInputElement;

      expect(inputElement.type).toBe('email');
      expect(inputElement.placeholder).toBe('Enter email');
      expect(inputElement.size).toBe(30);
      expect(inputElement.maxLength).toBe(100);
      expect(inputElement.minLength).toBe(5);
      expect(inputElement.pattern).toBe('[a-z]+');
      expect(inputElement.min).toBe('0');
      expect(inputElement.max).toBe('100');
      expect(inputElement.step).toBe('1');
      expect(inputElement.multiple).toBe(true);
      expect(inputElement.accept).toBe('.jpg,.png');
    });

    it('should handle anchor attributes', () => {
      const anchorElement = a({
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener noreferrer',
        download: 'file.pdf',
        hreflang: 'en',
        type: 'application/pdf',
      }) as HTMLAnchorElement;

      expect(anchorElement.href).toBe('https://example.com/');
      expect(anchorElement.target).toBe('_blank');
      expect(anchorElement.rel).toBe('noopener noreferrer');
      expect(anchorElement.download).toBe('file.pdf');
      expect(anchorElement.hreflang).toBe('en');
      expect(anchorElement.type).toBe('application/pdf');
    });

    it('should handle image attributes', () => {
      const imgElement = img({
        src: 'image.jpg',
        alt: 'Test image',
        width: 300,
        height: 200,
        loading: 'lazy',
        decoding: 'async',
        crossOrigin: 'anonymous',
        useMap: 'image-map',
        isMap: true,
      }) as HTMLImageElement;

      expect(imgElement.src).toBe('http://localhost/image.jpg');
      expect(imgElement.alt).toBe('Test image');
      expect(imgElement.width).toBe(300);
      expect(imgElement.height).toBe(200);
      expect(imgElement.loading).toBe('lazy');
      expect(imgElement.decoding).toBe('async');
      expect(imgElement.crossOrigin).toBe('anonymous');
      expect(imgElement.useMap).toBe('image-map');
      expect(imgElement.isMap).toBe(true);
    });

    it('should handle video attributes', () => {
      const videoElement = video({
        src: 'video.mp4',
        poster: 'poster.jpg',
        preload: 'metadata',
        autoplay: true,
        loop: true,
        muted: true,
        controls: true,
        width: 640,
        height: 360,
      }) as HTMLVideoElement;

      expect(videoElement.src).toBe('http://localhost/video.mp4');
      expect(videoElement.poster).toBe('poster.jpg');
      expect(videoElement.preload).toBe('metadata');
      expect(videoElement.autoplay).toBe(true);
      expect(videoElement.loop).toBe(true);
      expect(videoElement.muted).toBe(true);
      expect(videoElement.controls).toBe(true);
      expect(videoElement.width).toBe(640);
      expect(videoElement.height).toBe(360);
    });

    it('should handle audio attributes', () => {
      const audioElement = audio({
        src: 'audio.mp3',
        preload: 'auto',
        autoplay: false,
        loop: false,
        muted: false,
        controls: true,
      }) as HTMLAudioElement;

      expect(audioElement.src).toBe('http://localhost/audio.mp3');
      expect(audioElement.preload).toBe('auto');
      expect(audioElement.autoplay).toBe(false);
      expect(audioElement.loop).toBe(false);
      expect(audioElement.muted).toBe(false);
      expect(audioElement.controls).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should handle click events', () => {
      let clickCount = 0;
      const buttonElement = button(
        {
          onclick: () => {
            clickCount++;
          },
        },
        'Click me',
      );

      buttonElement.click();
      expect(clickCount).toBe(1);
    });

    it('should handle multiple event types', () => {
      const events: string[] = [];
      const inputElement = input({
        onfocus: () => {
          events.push('focus');
        },
        onblur: () => {
          events.push('blur');
        },
        oninput: () => {
          events.push('input');
        },
        onchange: () => {
          events.push('change');
        },
      });

      // Use simpler event dispatching for JSDOM compatibility
      const focusEvent = createEvent('focus');
      const blurEvent = createEvent('blur');
      const inputEvent = createEvent('input');
      const changeEvent = createEvent('change');

      inputElement.dispatchEvent(focusEvent);
      inputElement.dispatchEvent(blurEvent);
      inputElement.dispatchEvent(inputEvent);
      inputElement.dispatchEvent(changeEvent);

      expect(events).toEqual(['focus', 'blur', 'input', 'change']);
    });

    it('should handle mouse events', () => {
      const mouseEvents: string[] = [];
      const divElement = div({
        onmousedown: () => {
          mouseEvents.push('mousedown');
        },
        onmouseup: () => {
          mouseEvents.push('mouseup');
        },
        onmousemove: () => {
          mouseEvents.push('mousemove');
        },
        onmouseover: () => {
          mouseEvents.push('mouseover');
        },
        onmouseout: () => {
          mouseEvents.push('mouseout');
        },
        onclick: () => {
          mouseEvents.push('click');
        },
        ondblclick: () => {
          mouseEvents.push('doubleclick');
        },
        oncontextmenu: () => {
          mouseEvents.push('contextmenu');
        },
      });

      // Use simpler event dispatching for JSDOM compatibility
      divElement.dispatchEvent(createEvent('mousedown'));
      divElement.dispatchEvent(createEvent('mouseup'));
      divElement.dispatchEvent(createEvent('mousemove'));
      divElement.dispatchEvent(createEvent('mouseover'));
      divElement.dispatchEvent(createEvent('mouseout'));
      divElement.dispatchEvent(createEvent('click'));
      divElement.dispatchEvent(createEvent('dblclick'));
      divElement.dispatchEvent(createEvent('contextmenu'));

      expect(mouseEvents).toEqual([
        'mousedown',
        'mouseup',
        'mousemove',
        'mouseover',
        'mouseout',
        'click',
        'doubleclick',
        'contextmenu',
      ]);
    });

    it('should handle keyboard events', () => {
      const keyboardEvents: string[] = [];
      const inputElement = input({
        onkeydown: () => {
          keyboardEvents.push('keydown');
        },
        onkeyup: () => {
          keyboardEvents.push('keyup');
        },
        onkeypress: () => {
          keyboardEvents.push('keypress');
        },
      });

      // Use simpler event dispatching for JSDOM compatibility
      inputElement.dispatchEvent(createEvent('keydown'));
      inputElement.dispatchEvent(createEvent('keyup'));
      inputElement.dispatchEvent(createEvent('keypress'));

      expect(keyboardEvents).toEqual(['keydown', 'keyup', 'keypress']);
    });

    it('should handle form events', () => {
      const formEvents: string[] = [];
      const formElement = form({
        onsubmit: (e) => {
          e.preventDefault();
          formEvents.push('submit');
        },
        onreset: () => {
          formEvents.push('reset');
        },
      });

      // Use simpler event dispatching for JSDOM compatibility
      formElement.dispatchEvent(createEvent('submit'));
      formElement.dispatchEvent(createEvent('reset'));

      expect(formEvents).toEqual(['submit', 'reset']);
    });

    it('should handle drag and drop events', () => {
      const dragEvents: string[] = [];
      const divElement = div({
        ondrag: () => {
          dragEvents.push('drag');
        },
        ondragstart: () => {
          dragEvents.push('dragstart');
        },
        ondragend: () => {
          dragEvents.push('dragend');
        },
        ondragenter: () => {
          dragEvents.push('dragenter');
        },
        ondragleave: () => {
          dragEvents.push('dragleave');
        },
        ondragover: () => {
          dragEvents.push('dragover');
        },
        ondrop: () => {
          dragEvents.push('drop');
        },
      });

      // Use simpler event dispatching for JSDOM compatibility
      divElement.dispatchEvent(createEvent('drag'));
      divElement.dispatchEvent(createEvent('dragstart'));
      divElement.dispatchEvent(createEvent('dragend'));
      divElement.dispatchEvent(createEvent('dragenter'));
      divElement.dispatchEvent(createEvent('dragleave'));
      divElement.dispatchEvent(createEvent('dragover'));
      divElement.dispatchEvent(createEvent('drop'));

      expect(dragEvents).toEqual([
        'drag',
        'dragstart',
        'dragend',
        'dragenter',
        'dragleave',
        'dragover',
        'drop',
      ]);
    });

    it('should handle clipboard events', () => {
      const clipboardEvents: string[] = [];
      const divElement = div({
        oncopy: () => {
          clipboardEvents.push('copy');
        },
        oncut: () => {
          clipboardEvents.push('cut');
        },
        onpaste: () => {
          clipboardEvents.push('paste');
        },
      });

      // Use simpler event dispatching for JSDOM compatibility
      divElement.dispatchEvent(createEvent('copy'));
      divElement.dispatchEvent(createEvent('cut'));
      divElement.dispatchEvent(createEvent('paste'));

      expect(clipboardEvents).toEqual(['copy', 'cut', 'paste']);
    });

    it('should handle other events', () => {
      const otherEvents: string[] = [];
      const divElement = div({
        onload: () => {
          otherEvents.push('load');
        },
        onunload: () => {
          otherEvents.push('unload');
        },
        onresize: () => {
          otherEvents.push('resize');
        },
        onscroll: () => {
          otherEvents.push('scroll');
        },
        onselect: () => {
          otherEvents.push('select');
        },
        onwheel: () => {
          otherEvents.push('wheel');
        },
        onerror: () => {
          otherEvents.push('error');
        },
        onabort: () => {
          otherEvents.push('abort');
        },
      });

      // Use simpler event dispatching for JSDOM compatibility
      divElement.dispatchEvent(createEvent('load'));
      divElement.dispatchEvent(createEvent('unload'));
      divElement.dispatchEvent(createEvent('resize'));
      divElement.dispatchEvent(createEvent('scroll'));
      divElement.dispatchEvent(createEvent('select'));
      divElement.dispatchEvent(createEvent('wheel'));
      divElement.dispatchEvent(createEvent('error'));
      divElement.dispatchEvent(createEvent('abort'));

      expect(otherEvents).toEqual([
        'load',
        'unload',
        'resize',
        'scroll',
        'select',
        'wheel',
        'error',
        'abort',
      ]);
    });
  });

  describe('Reactive Properties', () => {
    it('should handle reactive className', () => {
      const classNameSignal = signal('initial-class');
      const element = div({ className: classNameSignal });

      expect(element.className).toBe('initial-class');

      classNameSignal.set('updated-class');
      expect(element.className).toBe('updated-class');
    });

    it('should handle reactive style', () => {
      const styleSignal = signal('color: red;');
      const element = div({ style: styleSignal });

      expect(element.style.cssText).toBe('color: red;');

      styleSignal.set('color: blue; font-size: 16px;');
      expect(element.style.cssText).toBe('color: blue; font-size: 16px;');
    });

    it('should handle reactive attributes', () => {
      const idSignal = signal('initial-id');
      const titleSignal = signal('Initial Title');
      const element = div({ id: idSignal, title: titleSignal });

      expect(element.id).toBe('initial-id');
      expect(element.title).toBe('Initial Title');

      idSignal.set('updated-id');
      titleSignal.set('Updated Title');

      expect(element.id).toBe('updated-id');
      expect(element.title).toBe('Updated Title');
    });

    it('should handle reactive boolean attributes', () => {
      const disabledSignal = signal(true);
      const checkedSignal = signal(false);
      const inputElement = input({
        disabled: disabledSignal,
        checked: checkedSignal,
      }) as HTMLInputElement;

      expect(inputElement.disabled).toBe(true);
      expect(inputElement.checked).toBe(false);

      disabledSignal.set(false);
      checkedSignal.set(true);

      expect(inputElement.disabled).toBe(false);
      expect(inputElement.checked).toBe(true);
    });

    it('should handle reactive input value', () => {
      const valueSignal = signal('initial value');
      const inputElement = input({ value: valueSignal }) as HTMLInputElement;

      expect(inputElement.value).toBe('initial value');

      valueSignal.set('updated value');
      expect(inputElement.value).toBe('updated value');
    });

    it('should handle reactive children', () => {
      const textSignal = signal('Initial text');
      const element = div(textSignal);

      expect(element.textContent).toBe('Initial text');

      textSignal.set('Updated text');
      expect(element.textContent).toBe('Updated text');
    });

    it('should handle computed values', () => {
      const countSignal = signal(0);
      const doubledSignal = computed(() => String(countSignal.get() * 2));
      const element = div({ className: doubledSignal });

      expect(element.className).toBe('0');

      countSignal.set(5);
      expect(element.className).toBe('10');
    });

    it('should handle multiple reactive properties', () => {
      const classNameSignal = signal('initial-class');
      const styleSignal = signal('color: red;');
      const idSignal = signal('initial-id');
      const element = div({
        className: classNameSignal,
        style: styleSignal,
        id: idSignal,
      });

      expect(element.className).toBe('initial-class');
      expect(element.style.cssText).toBe('color: red;');
      expect(element.id).toBe('initial-id');

      classNameSignal.set('updated-class');
      styleSignal.set('color: blue;');
      idSignal.set('updated-id');

      expect(element.className).toBe('updated-class');
      expect(element.style.cssText).toBe('color: blue;');
      expect(element.id).toBe('updated-id');
    });
  });

  describe('Dynamic Class Names', () => {
    it('should handle classNames prop with arrays', () => {
      const element = div({
        classNames: ['class1', 'class2', 'class3'],
      });

      expect(element.className).toBe('class1 class2 class3');
    });

    it('should handle classNames prop with objects', () => {
      const element = div({
        classNames: {
          class1: true,
          class2: false,
          class3: true,
          class4: false,
        },
      });

      expect(element.className).toBe('class1 class3');
    });

    it('should handle classNames prop with mixed values', () => {
      const element = div({
        classNames: [
          'class1',
          { class2: true, class3: false },
          'class4',
          null,
          undefined,
          false,
          true,
          42,
        ],
      });

      expect(element.className).toBe('class1 class2 class4 42');
    });

    it('should handle reactive classNames', () => {
      const classNamesSignal = signal(['class1', 'class2']);
      const element = div({ classNames: classNamesSignal });

      expect(element.className).toBe('class1 class2');

      classNamesSignal.set({
        class3: true,
        class4: false,
        class5: true,
      } as any);
      expect(element.className).toBe('class3 class5');
    });
  });

  describe('Template Strings', () => {
    it('should create template with static strings', () => {
      const element = template`Hello World`;
      expect(element.textContent).toBe('Hello World');
    });

    it('should create template with signals', () => {
      const nameSignal = signal('John');
      const element = template`Hello ${nameSignal}!`;

      expect(element.textContent).toBe('Hello John!');

      nameSignal.set('Jane');
      expect(element.textContent).toBe('Hello Jane!');
    });

    it('should create template with mixed content', () => {
      const countSignal = signal(0);
      const element = template`Count: ${countSignal}, Status: ${'active'}`;

      expect(element.textContent).toBe('Count: 0, Status: active');

      countSignal.set(5);
      expect(element.textContent).toBe('Count: 5, Status: active');
    });

    it('should create template with computed values', () => {
      const countSignal = signal(0);
      const doubledSignal = computed(() => countSignal.get() * 2);
      const element = template`Count: ${countSignal}, Doubled: ${doubledSignal}`;

      expect(element.textContent).toBe('Count: 0, Doubled: 0');

      countSignal.set(3);
      expect(element.textContent).toBe('Count: 3, Doubled: 6');
    });
  });

  describe('Reactive Lists', () => {
    it('should create reactive list with signals', () => {
      const itemsSignal = signal(['Apple', 'Banana', 'Cherry']);
      const list = createReactiveList(itemsSignal, (item, index) => li(item));

      expect(list.children.length).toBe(3);
      expect(list.children[0].textContent).toBe('Apple');
      expect(list.children[1].textContent).toBe('Banana');
      expect(list.children[2].textContent).toBe('Cherry');

      itemsSignal.set(['Orange', 'Grape']);
      expect(list.children.length).toBe(2);
      expect(list.children[0].textContent).toBe('Orange');
      expect(list.children[1].textContent).toBe('Grape');
    });

    it('should create reactive list with complex items', () => {
      const itemsSignal = signal([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);

      const list = createReactiveList(itemsSignal, (item, index) =>
        div({ className: 'item' }, `${item.name} (ID: ${item.id})`),
      );

      expect(list.children.length).toBe(2);
      expect(list.children[0].textContent).toBe('Item 1 (ID: 1)');
      expect(list.children[1].textContent).toBe('Item 2 (ID: 2)');

      itemsSignal.set([
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
      ]);

      expect(list.children.length).toBe(3);
      expect(list.children[0].textContent).toBe('Item 3 (ID: 3)');
      expect(list.children[1].textContent).toBe('Item 4 (ID: 4)');
      expect(list.children[2].textContent).toBe('Item 5 (ID: 5)');
    });

    it('should handle empty list', () => {
      const itemsSignal = signal<string[]>([]);
      const list = createReactiveList(itemsSignal, (item, index) => li(item));

      expect(list.children.length).toBe(0);

      itemsSignal.set(['New Item']);
      expect(list.children.length).toBe(1);
      expect(list.children[0].textContent).toBe('New Item');
    });
  });

  describe('Utility Functions', () => {
    it('should create custom elements with createElement', () => {
      const customElement = createElement('custom-tag');
      const element = customElement({ id: 'custom' }, 'Custom content');

      expect(element.tagName).toBe('CUSTOM-TAG');
      expect(element.id).toBe('custom');
      expect(element.textContent).toBe('Custom content');
    });

    it('should render component to container', () => {
      const container = div({ id: 'container' });
      const component = () => div('Hello World');

      render(component, container);

      expect(container.children.length).toBe(1);
      expect(container.children[0].textContent).toBe('Hello World');
    });

    it('should cleanup reactive subscriptions', () => {
      const classNameSignal = signal('initial-class');
      const element = div({ className: classNameSignal });

      expect(element.className).toBe('initial-class');

      cleanup(element);
      classNameSignal.set('updated-class');

      // After cleanup, the element should not update
      expect(element.className).toBe('initial-class');
    });

    it('should handle children prop', () => {
      const element = div({
        children: [span('Child 1'), span('Child 2')],
      });

      expect(element.children.length).toBe(2);
      expect(element.children[0].textContent).toBe('Child 1');
      expect(element.children[1].textContent).toBe('Child 2');
    });

    it('should handle mixed children prop and arguments', () => {
      const element = div(
        { children: [span('Child 1')] },
        span('Child 2'),
        span('Child 3'),
      );

      expect(element.children.length).toBe(3);
      expect(element.children[0].textContent).toBe('Child 1');
      expect(element.children[1].textContent).toBe('Child 2');
      expect(element.children[2].textContent).toBe('Child 3');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined children', () => {
      const element = div(null, undefined, 'Valid text', null, undefined);

      expect(element.textContent).toBe('Valid text');
      expect(element.children.length).toBe(0);
      expect(element.childNodes.length).toBe(1);
    });

    it('should handle boolean children', () => {
      const element = div(true, false, 'Text');

      expect(element.textContent).toBe('truefalseText');
      expect(element.children.length).toBe(0);
      expect(element.childNodes.length).toBe(3);
    });

    it('should handle numeric children', () => {
      const element = div(42, 3.14, -1);

      expect(element.textContent).toBe('423.14-1');
      expect(element.children.length).toBe(0);
      expect(element.childNodes.length).toBe(3);
    });

    it('should handle props as first child', () => {
      const element = div({ className: 'class' }, 'Text as first child');

      expect(element.textContent).toBe('Text as first child');
      expect(element.className).toBe('class');
    });

    it('should handle empty props object', () => {
      const element = div({}, 'Text');

      expect(element.textContent).toBe('Text');
      expect(element.children.length).toBe(0);
      expect(element.childNodes.length).toBe(1);
    });

    it('should handle reactive values that throw errors', () => {
      const errorSignal = {
        get: () => {
          throw new Error('Test error');
        },
        subscribe: () => () => {},
      } as any;

      const element = div({ className: errorSignal });

      // Should handle error gracefully
      expect(element.className).toBe('[Error]');
    });
  });

  describe('Performance and Memory', () => {
    it('should prevent infinite update loops', () => {
      const updateCount = signal(0);
      const element = div({
        className: computed(() => String(updateCount.get())),
      });

      // Simulate many rapid updates
      for (let i = 0; i < 100; i++) {
        updateCount.set(i);
      }

      // Should not crash and should have a reasonable final value
      expect(element.className).toBe('99');
    });

    it('should cleanup subscriptions properly', () => {
      const signal1 = signal('value1');
      const signal2 = signal('value2');
      const element = div({
        className: signal1,
        title: signal2,
      });

      // Verify initial values
      expect(element.className).toBe('value1');
      expect(element.title).toBe('value2');

      // Cleanup
      cleanup(element);

      // Update signals after cleanup
      signal1.set('new-value1');
      signal2.set('new-value2');

      // Values should not change after cleanup
      expect(element.className).toBe('value1');
      expect(element.title).toBe('value2');
    });

    it('should handle multiple cleanup calls safely', () => {
      const element = div({ className: 'test' });

      // Multiple cleanup calls should not cause errors
      expect(() => {
        cleanup(element);
        cleanup(element);
        cleanup(element);
      }).not.toThrow();
    });
  });
});

describe('createReactiveComponent', () => {
  test('should create a reactive component that re-renders when signals change', () => {
    const { signal } = require('./signals');

    let renderCount = 0;
    const testSignal = signal(0);

    const TestComponent = createReactiveComponent(() => {
      renderCount++;
      const value = testSignal.get();
      return div({ className: 'test-component' }, `Value: ${value}`);
    });

    // Create a container
    const container = document.createElement('div');

    // Initial render
    render(TestComponent, container);
    expect(renderCount).toBe(1);
    expect(container.querySelector('.test-component')?.textContent).toBe(
      'Value: 0',
    );

    // Update signal - should trigger re-render
    testSignal.set(42);

    // Wait for next tick to allow effect to run
    return new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
      expect(renderCount).toBe(3);
      expect(container.querySelector('.test-component')?.textContent).toBe(
        'Value: 42',
      );
    });
  });

  test('should prevent infinite loops during rendering', () => {
    const { signal } = require('./signals');

    let renderCount = 0;
    const testSignal = signal(0);

    const TestComponent = createReactiveComponent(() => {
      renderCount++;
      const value = testSignal.get();

      // This would cause infinite loops without protection
      if (value < 5) {
        testSignal.set(value + 1);
      }

      return div({ className: 'test-component' }, `Value: ${value}`);
    });

    const container = document.createElement('div');
    render(TestComponent, container);

    // Wait for effects to settle
    return new Promise((resolve) => setTimeout(resolve, 10)).then(() => {
      // Should not have infinite renders
      expect(renderCount).toBeLessThan(10);
      expect(testSignal.get()).toBe(5);
    });
  });

  test('should track signal dependencies in effect', () => {
    const { signal, effect } = require('./signals');

    const testSignal = signal(0);
    let effectRunCount = 0;
    let lastValue = 0;

    // Create a simple effect to test dependency tracking
    const cleanup = effect(() => {
      effectRunCount++;
      lastValue = testSignal.get();
    });

    // Initial run
    expect(effectRunCount).toBe(1);
    expect(lastValue).toBe(0);

    // Update signal - should trigger effect
    testSignal.set(42);

    // Wait for effect to run
    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(effectRunCount).toBe(2);
      expect(lastValue).toBe(42);

      // Cleanup
      cleanup();
    });
  });

  test('should create a reactive component with props', () => {
    const { signal } = require('./signals');

    let renderCount = 0;
    const testSignal = signal(0);

    type TestProps = {
      title: string;
      value: number;
      onUpdate: () => void;
    };

    const TestComponent = createReactiveComponent<TestProps>((props) => {
      renderCount++;
      const value = testSignal.get();
      return div(
        { className: 'test-component' },
        div({ className: 'title' }, props?.title || 'Default'),
        div({ className: 'value' }, `Value: ${value}`),
        button({ onclick: props?.onUpdate || (() => {}) }, 'Update'),
      );
    });

    // Create a container
    const container = document.createElement('div');

    // Initial render with props
    render(TestComponent, container, {
      title: 'Test Title',
      value: 0,
      onUpdate: () => testSignal.set(42),
    });
    expect(renderCount).toBe(1);
    expect(container.querySelector('.title')?.textContent).toBe('Test Title');
    expect(container.querySelector('.value')?.textContent).toBe('Value: 0');

    // Update signal - should trigger re-render
    testSignal.set(42);

    // Wait for next tick to allow effect to run
    return new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
      expect(renderCount).toBe(3);
      expect(container.querySelector('.value')?.textContent).toBe('Value: 42');
    });
  });
});
