import { component, div, PostRenderCallback } from '../src/index';

// Example 1: Debug logging (like your use case)
const debugCallback: PostRenderCallback = (element) => {
  console.log('Component rendered:', element);
  console.log('Content:', element.textContent);
  console.log('Children count:', element.children.length);

  return () => {
    console.log('Component cleanup called');
  };
};

const DebugComponent = component((_props, utils) => {
  const count = utils.signal(0);

  // Simulate updating the component every 2 seconds
  setTimeout(() => count.set(count.get() + 1), 2000);

  return div({ style: 'padding: 20px; border: 1px solid #ccc; margin: 10px;' }, `Debug Counter: ${count.get()}`);
}, debugCallback);

// Example 2: Third-party library integration
const analyticsCallback: PostRenderCallback = (element) => {
  // Simulate analytics tracking
  console.log('📊 Analytics: Component rendered with', element.children.length, 'children');

  const observer = new MutationObserver((mutations) => {
    console.log('📊 Analytics: DOM mutations detected:', mutations.length);
  });

  observer.observe(element, { childList: true, subtree: true });

  return () => {
    console.log('📊 Analytics: Stopping observation');
    observer.disconnect();
  };
};

const AnalyticsComponent = component((_props, utils) => {
  const items = utils.signal(['Item 1', 'Item 2']);

  // Add a new item every 3 seconds
  setTimeout(() => {
    const current = items.get();
    items.set([...current, `Item ${current.length + 1}`]);
  }, 3000);

  return div(
    { style: 'padding: 20px; border: 1px solid #007acc; margin: 10px;' },
    div('Analytics Demo:'),
    ...items.get().map((item) => div(item)),
  );
}, analyticsCallback);

// Example 3: Performance monitoring
const performanceCallback: PostRenderCallback = (element) => {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    console.log(`⚡ Performance: Component was active for ${endTime - startTime}ms`);
  };
};

const PerformanceComponent = component((_props, utils) => {
  const status = utils.signal('Loading...');

  // Simulate loading completion after 1 second
  setTimeout(() => status.set('Loaded!'), 1000);

  return div({ style: 'padding: 20px; border: 1px solid #28a745; margin: 10px;' }, `Performance Demo: ${status.get()}`);
}, performanceCallback);

// Render all examples
if (typeof document !== 'undefined') {
  const container = document.createElement('div');
  container.innerHTML = '<h1>Post-Render Callback Examples</h1>';

  container.appendChild(DebugComponent());
  container.appendChild(AnalyticsComponent());
  container.appendChild(PerformanceComponent());

  document.body.appendChild(container);
}

export { AnalyticsComponent, DebugComponent, PerformanceComponent };
