# Tree Example Demo Guide

## 🚀 Quick Start

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Open browser**: Navigate to `http://localhost:5174`

## 🎯 Interactive Features

### 1. Tree Navigation

- **Click arrows** (▶/▼) next to folder names to expand/collapse
- **Click node names** to select them (highlighted in blue)
- **Visual indicators** show folder structure with connecting lines

### 2. Search & Filter

- **Type in search box** to filter nodes in real-time
- **Search highlights** appear around matching text
- **Empty state** shows when no results found

### 3. Bulk Operations

- **Expand All**: Opens all folders at once
- **Collapse All**: Closes all folders at once
- **Reset**: Clears all state (expanded/collapsed, selection, search)

### 4. Dynamic Operations

- **Add Node**: Creates a random node in the root folder
- **Remove Selected**: Deletes the currently selected node
- **Real-time updates** show changes immediately

### 5. Live Statistics

- **Node counts**: Total, files, folders
- **Size information**: Total file sizes in human-readable format
- **State tracking**: Number of expanded vs collapsed paths

## 🔍 Key Patterns Demonstrated

### collapsedPaths Signal

```typescript
const collapsedPaths = signal<Record<string, boolean>>({});
```

**State examples:**

```typescript
{
  "src": false,           // src folder expanded
  "src/components": true, // components folder collapsed
  "docs": false,          // docs folder expanded
}
```

### Path Generation

- **Root level**: `"root"`
- **Nested levels**: `"root/src/components"`
- **Unique identification** for each node in the tree

### Reactive Updates

- **Automatic re-rendering** when signals change
- **Computed values** for derived state
- **Batch updates** for performance optimization

## 🎨 UI Features

### Visual Design

- **Glassmorphism effects** with backdrop filters
- **Smooth animations** for expand/collapse
- **Responsive layout** that works on mobile
- **Modern typography** with system fonts

### Tree Structure

- **Hierarchical indentation** with connecting lines
- **Icon system** for different file types
- **Hover effects** for interactive feedback
- **Selection highlighting** for current focus

### Controls

- **Search input** with real-time filtering
- **View mode selector** (tree/list - placeholder)
- **Action buttons** for bulk operations
- **Statistics panel** with live updates

## 🧪 Testing Scenarios

### Basic Functionality

1. Click folder arrows to expand/collapse
2. Select different nodes
3. Use search to filter results
4. Try bulk operations (expand all, collapse all)

### Edge Cases

1. Search for non-existent terms
2. Remove nodes and verify tree updates
3. Add many nodes to test performance
4. Test with empty folders

### Performance

1. Expand all nodes to see rendering
2. Search with large trees
3. Add/remove nodes rapidly
4. Monitor console for state updates

## 🔧 Customization Ideas

### Add New Features

- **Drag & Drop**: Reorder nodes
- **Keyboard Navigation**: Arrow keys, enter, space
- **Context Menus**: Right-click actions
- **Multi-selection**: Ctrl+click for multiple nodes

### Enhance Visuals

- **Custom icons**: Different emojis or SVG icons
- **Color themes**: Light/dark mode toggle
- **Animations**: Smooth transitions for all changes
- **Tooltips**: Hover information for nodes

### Extend Functionality

- **File operations**: Copy, paste, move
- **Sorting**: By name, size, date
- **Filtering**: By type, size, date range
- **Export**: Save tree structure to JSON

## 📊 Console Debugging

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

**Watch for:**

- State changes when expanding/collapsing
- Search term updates
- Node selection changes
- Bulk operation results

## 🎉 Success Indicators

You'll know the example is working when:

- ✅ Tree renders with sample data
- ✅ Clicking arrows expands/collapses folders
- ✅ Search filters nodes in real-time
- ✅ Bulk operations work correctly
- ✅ Statistics update automatically
- ✅ Console shows state changes
- ✅ No TypeScript errors in build

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Change port in `vite.config.ts`
2. **Build errors**: Run `npm run build` to see issues
3. **Import errors**: Check path to `../../src/index.js`
4. **Type errors**: Ensure TypeScript compilation passes

### Debug Steps

1. Check browser console for errors
2. Verify all dependencies installed
3. Confirm TypeScript compilation works
4. Test with different browsers
5. Check network tab for failed requests

---

**Happy tree building! 🌳✨**
