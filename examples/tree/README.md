# Tacit-DOM Tree Example

A comprehensive example demonstrating how to build an interactive tree component using Tacit-DOM's reactive signals, specifically showcasing the `collapsedPaths` signal pattern for managing expandable/collapsible tree nodes.

## 🌟 Features

- **Interactive Tree Navigation**: Expand/collapse folders with visual indicators
- **Reactive State Management**: Uses `collapsedPaths` signal to track node states
- **Search Functionality**: Real-time filtering with highlighted search terms
- **Node Selection**: Click to select nodes with visual feedback
- **Dynamic Operations**: Add/remove nodes dynamically
- **Bulk Operations**: Expand all, collapse all, and reset functionality
- **Real-time Statistics**: Live updates of tree metrics
- **Responsive Design**: Modern UI with smooth animations

## 🚀 Key Concepts Demonstrated

### 1. `collapsedPaths` Signal Pattern

The core of this example is the `collapsedPaths` signal that manages the expanded/collapsed state of tree nodes:

```typescript
const collapsedPaths = signal<Record<string, boolean>>({});
```

**How it works:**

- **Key**: The path to each node (e.g., `"src/components"`, `"docs/README.md"`)
- **Value**: `true` if collapsed, `false` if expanded, `undefined` if not yet visited
- **Updates**: Automatically triggers re-renders when paths change

**Example state:**

```typescript
{
  "src": false,           // src folder is expanded
  "src/components": true, // components folder is collapsed
  "docs": false,          // docs folder is expanded
  "tests": true           // tests folder is collapsed
}
```

### 2. Path Generation Strategy

Paths are generated using a hierarchical approach:

```typescript
function renderTreeNode(node: TreeNode, path: string = ''): HTMLElement {
  const currentPath = path ? `${path}/${node.id}` : node.id;
  const isCollapsed = collapsedPaths[currentPath] || false;
  // ... rest of rendering logic
}
```

This creates unique identifiers for each node level:

- Root: `"root"`
- First level: `"root/src"`, `"root/docs"`
- Second level: `"root/src/components"`, `"root/src/utils"`
- And so on...

### 3. Reactive Computed Values

Several computed values provide real-time insights:

```typescript
const expandedCount = computed(() => {
  const paths = collapsedPaths.get();
  return Object.keys(paths).filter((path) => !paths[path]).length;
});

const collapsedCount = computed(() => {
  const paths = collapsedPaths.get();
  return Object.keys(paths).filter((path) => paths[path]).length;
});
```

### 4. Batch Updates for Performance

Multiple state changes are batched together for better performance:

```typescript
function expandAll() {
  batch(() => {
    const allPaths = getAllPaths(treeData.get());
    const newCollapsedPaths: Record<string, boolean> = {};
    allPaths.forEach((path) => {
      newCollapsedPaths[path] = false;
    });
    collapsedPaths.set(newCollapsedPaths);
  });
}
```

## 🏗️ Architecture

### Component Structure

```
TreeApp (Main Container)
├── Header
├── Controls (Search, View Mode, Action Buttons)
└── TreeContainer
    ├── TreeStats (Live Statistics)
    └── TreeComponent (Recursive Tree Renderer)
        └── TreeNode (Individual Node)
            ├── Toggle Button (Expand/Collapse)
            ├── Icon (Folder/File Type)
            ├── Label (Node Name)
            └── Children (Recursive)
```

### Data Flow

1. **User Interaction** → Event Handler
2. **State Update** → Signal `.set()` or `.update()`
3. **Reactive Update** → Computed values recalculate
4. **DOM Update** → Component re-renders automatically
5. **Visual Feedback** → User sees immediate changes

## 🎯 Usage Examples

### Basic Tree Node Toggle

```typescript
function toggleNode(path: string) {
  collapsedPaths.update((current) => ({
    ...current,
    [path]: !current[path],
  }));
}
```

### Bulk State Management

```typescript
function collapseAll() {
  batch(() => {
    const allPaths = getAllPaths(treeData.get());
    const newCollapsedPaths: Record<string, boolean> = {};
    allPaths.forEach((path) => {
      newCollapsedPaths[path] = true; // true = collapsed
    });
    collapsedPaths.set(newCollapsedPaths);
  });
}
```

### Search with Highlighting

```typescript
const visibleNodes = computed(() => {
  const term = searchTerm.get().toLowerCase();
  if (!term) return treeData.get();

  return filterTreeNodes(treeData.get(), term);
});
```

## 🔧 Customization

### Adding New Node Types

1. Extend the `TreeNode` type:

```typescript
type TreeNode = {
  // ... existing properties
  type: 'folder' | 'file' | 'image' | 'document' | 'your-new-type';
  customProperty?: string;
};
```

2. Add icon mapping:

```typescript
function getNodeIcon(type: string): string {
  switch (type) {
    // ... existing cases
    case 'your-new-type':
      return '🔧';
    default:
      return '📄';
  }
}
```

### Custom Styling

The CSS uses CSS custom properties and modern features:

- **Backdrop filters** for glassmorphism effects
- **CSS Grid/Flexbox** for responsive layouts
- **CSS transitions** for smooth animations
- **Media queries** for mobile responsiveness

### Performance Optimizations

- **Lazy rendering**: Children only render when expanded
- **Memoized computations**: Expensive operations cached in computed values
- **Batch updates**: Multiple state changes grouped together
- **Event delegation**: Efficient event handling for large trees

## 🧪 Testing the Example

### Running Locally

```bash
cd examples/tree
npm install
npm run dev
```

The example will open in your browser at `http://localhost:5174`.

### Interactive Testing

1. **Expand/Collapse**: Click the arrow buttons next to folder names
2. **Search**: Type in the search box to filter nodes
3. **Selection**: Click on any node to select it
4. **Bulk Operations**: Use the control buttons to manipulate the entire tree
5. **Dynamic Changes**: Add/remove nodes to see real-time updates

### Console Debugging

The example includes comprehensive logging:

```typescript
effect(() => {
  console.log('Tree state updated:', {
    collapsedPaths: collapsedPaths.get(),
    selectedNode: selectedNode.get()?.name,
    searchTerm: searchTerm.get(),
    expandedCount: expandedCount.get(),
    collapsedCount: collapsedCount.get(),
  });
});
```

## 📚 Related Documentation

- [Signals Guide](../../docs/SIGNALS.md) - Core reactive primitives
- [DOM Utilities](../../docs/DOM_INTERNALS.md) - Element creation and manipulation
- [API Reference](../../docs/API.md) - Complete API documentation

## 🤝 Contributing

This example demonstrates best practices for building complex UI components with Tacit-DOM. Feel free to:

- Add new features (drag & drop, keyboard navigation, etc.)
- Improve the styling and animations
- Add more tree operations (copy/paste, move, etc.)
- Create variations (file browser, menu system, etc.)

## 📄 License

This example is part of the Tacit-DOM project and follows the same license terms.
