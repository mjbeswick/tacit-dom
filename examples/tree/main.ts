import {
  batch,
  button,
  component,
  computed,
  div,
  effect,
  h1,
  h3,
  input,
  label,
  p,
  render,
  select,
  signal,
  span,
  type Computed,
  type Signal,
} from '../../src/index.js';

// Types for our tree structure
type TreeNode = {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'document';
  children?: TreeNode[];
  size?: number;
  modified?: string;
};

type TreeProps = {
  data: TreeNode[] | Signal<TreeNode[]> | Computed<TreeNode[]>;
  collapsedPaths: Record<string, boolean> | Signal<Record<string, boolean>>;
  onToggle: (path: string) => void;
  onSelect: (node: TreeNode) => void;
  selectedNode?: TreeNode | Signal<TreeNode | undefined>;
  searchTerm?: string | Signal<string>;
};

// Sample tree data
const sampleTreeData: TreeNode[] = [
  {
    id: 'root',
    name: 'Project Root',
    type: 'folder',
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        children: [
          {
            id: 'src/components',
            name: 'components',
            type: 'folder',
            children: [
              {
                id: 'src/components/Button.tsx',
                name: 'Button.tsx',
                type: 'file',
                size: 2048,
                modified: '2024-01-15',
              },
              {
                id: 'src/components/Modal.tsx',
                name: 'Modal.tsx',
                type: 'file',
                size: 4096,
                modified: '2024-01-14',
              },
              {
                id: 'src/components/Header.tsx',
                name: 'Header.tsx',
                type: 'file',
                size: 1536,
                modified: '2024-01-13',
              },
            ],
          },
          {
            id: 'src/utils',
            name: 'utils',
            type: 'folder',
            children: [
              {
                id: 'src/utils/helpers.ts',
                name: 'helpers.ts',
                type: 'file',
                size: 1024,
                modified: '2024-01-12',
              },
              {
                id: 'src/utils/validation.ts',
                name: 'validation.ts',
                type: 'file',
                size: 2048,
                modified: '2024-01-11',
              },
            ],
          },
          {
            id: 'src/assets',
            name: 'assets',
            type: 'folder',
            children: [
              {
                id: 'src/assets/logo.svg',
                name: 'logo.svg',
                type: 'image',
                size: 5120,
                modified: '2024-01-10',
              },
              {
                id: 'src/assets/icon.png',
                name: 'icon.png',
                type: 'image',
                size: 8192,
                modified: '2024-01-09',
              },
            ],
          },
          {
            id: 'src/main.ts',
            name: 'main.ts',
            type: 'file',
            size: 3072,
            modified: '2024-01-16',
          },
          {
            id: 'src/index.ts',
            name: 'index.ts',
            type: 'file',
            size: 1024,
            modified: '2024-01-15',
          },
        ],
      },
      {
        id: 'docs',
        name: 'docs',
        type: 'folder',
        children: [
          {
            id: 'docs/README.md',
            name: 'README.md',
            type: 'document',
            size: 1536,
            modified: '2024-01-15',
          },
          {
            id: 'docs/API.md',
            name: 'API.md',
            type: 'document',
            size: 4096,
            modified: '2024-01-14',
          },
          {
            id: 'docs/CHANGELOG.md',
            name: 'CHANGELOG.md',
            type: 'document',
            size: 2048,
            modified: '2024-01-13',
          },
        ],
      },
      {
        id: 'tests',
        name: 'tests',
        type: 'folder',
        children: [
          { id: 'tests/unit', name: 'unit', type: 'folder', children: [] },
          {
            id: 'tests/integration',
            name: 'integration',
            type: 'folder',
            children: [],
          },
        ],
      },
      {
        id: 'package.json',
        name: 'package.json',
        type: 'file',
        size: 1024,
        modified: '2024-01-16',
      },
      {
        id: 'tsconfig.json',
        name: 'tsconfig.json',
        type: 'file',
        size: 512,
        modified: '2024-01-16',
      },
      {
        id: 'README.md',
        name: 'README.md',
        type: 'document',
        size: 2048,
        modified: '2024-01-15',
      },
    ],
  },
];

// Tree component that uses collapsedPaths signal
const TreeComponent = component<TreeProps>((props) => {
  const { data, collapsedPaths, onToggle, onSelect, selectedNode, searchTerm } =
    props;

  console.log('🌳 TreeComponent rendered with props:', {
    dataType: typeof data,
    hasDataGet: !!(data as any).get,
    collapsedPathsType: typeof collapsedPaths,
    hasCollapsedPathsGet: !!(collapsedPaths as any).get,
    selectedNodeType: typeof selectedNode,
    hasSelectedNodeGet: !!(selectedNode as any).get,
    searchTermType: typeof searchTerm,
    hasSearchTermGet: !!(searchTerm as any).get,
  });

  function renderTreeNode(node: TreeNode, path: string = ''): HTMLElement {
    const currentPath = path ? `${path}/${node.id}` : node.id;

    // Handle reactive values with proper type checking
    const collapsedPathsValue = (collapsedPaths as any).get
      ? (collapsedPaths as any).get()
      : collapsedPaths;
    const selectedNodeValue =
      selectedNode && (selectedNode as any).get
        ? (selectedNode as any).get()
        : selectedNode;
    const searchTermValue =
      searchTerm && (searchTerm as any).get
        ? (searchTerm as any).get()
        : searchTerm;

    const isCollapsed = collapsedPathsValue[currentPath] || false;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNodeValue?.id === node.id;

    // Highlight search term in node name
    const displayName =
      searchTermValue && searchTermValue.length > 0
        ? highlightSearchTerm(node.name, searchTermValue)
        : node.name;

    const nodeContent = div(
      {
        className: `tree-node-content ${isSelected ? 'selected' : ''}`,
        onclick: (e: Event) => {
          console.log('🔍 Node clicked:', {
            node: node.name,
            id: node.id,
            type: node.type,
          });
          console.log('🔍 Event details:', {
            target: e.target,
            currentTarget: e.currentTarget,
            eventType: e.type,
          });
          onSelect(node);
        },
      },
      // Toggle button for folders
      hasChildren
        ? div(
            {
              className: `tree-toggle ${isCollapsed ? 'collapsed' : ''}`,
              onclick: (e: Event) => {
                console.log('🔽 Toggle clicked:', {
                  path: currentPath,
                  isCollapsed,
                  nodeName: node.name,
                });
                console.log('🔽 Event details:', {
                  target: e.target,
                  currentTarget: e.currentTarget,
                  eventType: e.type,
                });
                e.stopPropagation();
                onToggle(currentPath);
              },
            },
            isCollapsed ? '▶' : '▼',
          )
        : div({ className: 'tree-toggle' }, ''),

      // Node icon
      div({ className: `tree-icon ${node.type}` }, getNodeIcon(node.type)),

      // Node label
      div({ className: 'tree-label' }, displayName),

      // File size and modified date for files
      node.type !== 'folder'
        ? div(
            { style: 'color: #666; font-size: 0.8rem; margin-left: auto;' },
            formatFileSize(node.size || 0),
          )
        : null,
    );

    if (!hasChildren) {
      return div({ className: 'tree-node' }, nodeContent);
    }

    const children = div(
      { className: 'tree-children' },
      ...node.children!.map((child) => renderTreeNode(child, currentPath)),
    );

    return div(
      { className: 'tree-node' },
      nodeContent,
      isCollapsed ? null : children,
    );
  }

  // Handle reactive data with proper type checking
  const dataValue = (data as any).get ? (data as any).get() : data;

  return div(
    { className: 'tree' },
    ...dataValue.map((node: TreeNode) => renderTreeNode(node)),
  );
});

// Helper function to highlight search terms
function highlightSearchTerm(text: string, searchTerm: string): HTMLElement {
  if (!searchTerm || searchTerm.length === 0) {
    return span(text);
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return span(
    ...parts.map((part) =>
      regex.test(part)
        ? span({ className: 'search-highlight' }, part)
        : span(part),
    ),
  );
}

// Helper function to get appropriate icon for node type
function getNodeIcon(type: string): string {
  switch (type) {
    case 'folder':
      return '📁';
    case 'file':
      return '📄';
    case 'image':
      return '🖼️';
    case 'document':
      return '📝';
    default:
      return '📄';
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Main app component
const TreeApp = component(() => {
  // Core signals
  const treeData = signal<TreeNode[]>(sampleTreeData);
  const collapsedPaths = signal<Record<string, boolean>>({});
  const selectedNode = signal<TreeNode | undefined>(undefined);
  const searchTerm = signal<string>('');
  const viewMode = signal<'tree' | 'list'>('tree');

  // Computed values
  const visibleNodes = computed(() => {
    const term = searchTerm.get().toLowerCase();
    if (!term) return treeData.get();

    return filterTreeNodes(treeData.get(), term);
  });

  const treeStats = computed(() => {
    const data = treeData.get();
    const totalNodes = countNodes(data);
    const totalFiles = countFiles(data);
    const totalFolders = countFolders(data);
    const totalSize = calculateTotalSize(data);

    return { totalNodes, totalFiles, totalFolders, totalSize };
  });

  const expandedCount = computed(() => {
    const paths = collapsedPaths.get();
    return Object.keys(paths).filter((path) => !paths[path]).length;
  });

  const collapsedCount = computed(() => {
    const paths = collapsedPaths.get();
    return Object.keys(paths).filter((path) => paths[path]).length;
  });

  // Event handlers
  function toggleNode(path: string) {
    console.log('🔄 Toggle node called:', { path });
    collapsedPaths.update((current) => {
      const newValue = !current[path];
      console.log('🔄 Updating collapsedPaths:', {
        path,
        oldValue: current[path],
        newValue,
      });
      return {
        ...current,
        [path]: newValue,
      };
    });
  }

  function expandAll() {
    console.log('📂 Expand all called');
    batch(() => {
      const allPaths = getAllPaths(treeData.get());
      const newCollapsedPaths: Record<string, boolean> = {};
      allPaths.forEach((path) => {
        newCollapsedPaths[path] = false;
      });
      console.log('📂 Setting all paths to expanded:', allPaths);
      collapsedPaths.set(newCollapsedPaths);
    });
  }

  function collapseAll() {
    console.log('📁 Collapse all called');
    batch(() => {
      const allPaths = getAllPaths(treeData.get());
      const newCollapsedPaths: Record<string, boolean> = {};
      allPaths.forEach((path) => {
        newCollapsedPaths[path] = true;
      });
      console.log('📁 Setting all paths to collapsed:', allPaths);
      collapsedPaths.set(newCollapsedPaths);
    });
  }

  function resetTree() {
    console.log('🔄 Reset tree called');
    batch(() => {
      collapsedPaths.set({});
      selectedNode.set(undefined);
      searchTerm.set('');
    });
  }

  function addRandomNode() {
    console.log('➕ Add random node called');
    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      name: `New Node ${Math.floor(Math.random() * 1000)}`,
      type: Math.random() > 0.5 ? 'folder' : 'file',
      size: Math.floor(Math.random() * 10000),
      modified: new Date().toISOString().split('T')[0],
    };

    treeData.update((current) => {
      const newData = [...current];
      if (newData[0]?.children) {
        newData[0].children = [...(newData[0].children || []), newNode];
      }
      return newData;
    });
  }

  function removeSelectedNode() {
    const selected = selectedNode.get();
    console.log('🗑️ Remove selected node called:', {
      selected: selected?.name,
    });
    if (!selected) return;

    treeData.update((current) => {
      return removeNodeFromTree(current, selected.id);
    });
    selectedNode.set(undefined);
  }

  // Helper functions
  function filterTreeNodes(nodes: TreeNode[], term: string): TreeNode[] {
    return nodes.filter((node) => {
      const matches = node.name.toLowerCase().includes(term);
      if (node.children) {
        const filteredChildren = filterTreeNodes(node.children, term);
        if (filteredChildren.length > 0) {
          node = { ...node, children: filteredChildren };
          return true;
        }
      }
      return matches;
    });
  }

  function countNodes(nodes: TreeNode[]): number {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? countNodes(node.children) : 0);
    }, 0);
  }

  function countFiles(nodes: TreeNode[]): number {
    return nodes.reduce((count, node) => {
      return (
        count +
        (node.type !== 'folder' ? 1 : 0) +
        (node.children ? countFiles(node.children) : 0)
      );
    }, 0);
  }

  function countFolders(nodes: TreeNode[]): number {
    return nodes.reduce((count, node) => {
      return (
        count +
        (node.type === 'folder' ? 1 : 0) +
        (node.children ? countFolders(node.children) : 0)
      );
    }, 0);
  }

  function calculateTotalSize(nodes: TreeNode[]): number {
    return nodes.reduce((total, node) => {
      return (
        total +
        (node.size || 0) +
        (node.children ? calculateTotalSize(node.children) : 0)
      );
    }, 0);
  }

  function getAllPaths(nodes: TreeNode[], parentPath: string = ''): string[] {
    const paths: string[] = [];
    nodes.forEach((node) => {
      const currentPath = parentPath ? `${parentPath}/${node.id}` : node.id;
      if (node.children && node.children.length > 0) {
        paths.push(currentPath);
        paths.push(...getAllPaths(node.children, currentPath));
      }
    });
    return paths;
  }

  function removeNodeFromTree(nodes: TreeNode[], id: string): TreeNode[] {
    return nodes.filter((node) => {
      if (node.id === id) return false;
      if (node.children) {
        node.children = removeNodeFromTree(node.children, id);
      }
      return true;
    });
  }

  // Effect to log state changes for debugging
  effect(() => {
    const paths = collapsedPaths.get();
    const selected = selectedNode.get();
    const search = searchTerm.get();

    console.log('🌳 Tree state updated:', {
      collapsedPaths: paths,
      selectedNode: selected?.name,
      searchTerm: search,
      expandedCount: expandedCount.get(),
      collapsedCount: collapsedCount.get(),
    });
  });

  // Effect to log when the component renders
  effect(() => {
    console.log('🎨 TreeApp component rendering with:', {
      treeDataLength: treeData.get().length,
      visibleNodesLength: visibleNodes.get().length,
      collapsedPathsCount: Object.keys(collapsedPaths.get()).length,
      selectedNodeName: selectedNode.get()?.name,
      searchTerm: searchTerm.get(),
    });
  });

  return div(
    // Header
    div(
      { className: 'header' },
      h1('🌳 Tacit-DOM Tree Example'),
      p(
        'Interactive tree component with collapsible nodes using reactive signals',
      ),
      // Test button to verify event handling
      button(
        {
          className: 'btn test-btn',
          style:
            'background: #ff6b6b; color: white; padding: 15px; font-size: 16px; border: 3px solid #fff; cursor: pointer;',
          onclick: () => {
            console.log('🧪 Test button clicked! Event handling is working!');
            alert('Test button clicked! Event handling is working!');
          },
        },
        '🧪 Test Event Handling',
      ),
    ),

    // Controls
    div(
      { className: 'controls' },
      div(
        { className: 'control-group' },
        label('Search:'),
        input({
          type: 'text',
          placeholder: 'Search nodes...',
          value: searchTerm.get(),
          oninput: (e: Event) => {
            const value = (e.target as HTMLInputElement).value;
            console.log('🔍 Search input changed:', { value });
            searchTerm.set(value);
          },
        }),
      ),

      div(
        { className: 'control-group' },
        label('View Mode:'),
        select(
          {
            value: viewMode.get(),
            onchange: (e: Event) => {
              const value = (e.target as HTMLSelectElement).value as
                | 'tree'
                | 'list';
              console.log('👁️ View mode changed:', { value });
              viewMode.set(value);
            },
          },
          option({ value: 'tree' }, 'Tree View'),
          option({ value: 'list' }, 'List View'),
        ),
      ),

      button(
        {
          className: 'btn primary',
          onclick: () => {
            console.log('📂 Expand All button clicked');
            expandAll();
          },
        },
        'Expand All',
      ),

      button(
        {
          className: 'btn',
          onclick: () => {
            console.log('📁 Collapse All button clicked');
            collapseAll();
          },
        },
        'Collapse All',
      ),

      button(
        {
          className: 'btn',
          onclick: () => {
            console.log('🔄 Reset button clicked');
            resetTree();
          },
        },
        'Reset',
      ),

      button(
        {
          className: 'btn primary',
          onclick: () => {
            console.log('➕ Add Node button clicked');
            addRandomNode();
          },
        },
        'Add Node',
      ),

      button(
        {
          className: 'btn danger',
          onclick: () => {
            console.log('🗑️ Remove Selected button clicked');
            removeSelectedNode();
          },
          disabled: !selectedNode.get(),
        },
        'Remove Selected',
      ),
    ),

    // Tree Container
    div(
      { className: 'tree-container' },
      // Tree Stats
      div(
        { className: 'tree-stats' },
        p(
          span('📊 Tree Statistics: '),
          span(`Total: ${treeStats.get().totalNodes} nodes, `),
          span(`Files: ${treeStats.get().totalFiles}, `),
          span(`Folders: ${treeStats.get().totalFolders}, `),
          span(`Size: ${formatFileSize(treeStats.get().totalSize)}`),
        ),
        p(
          span('🔽 Collapsed: '),
          span(`${collapsedCount.get()} paths, `),
          span('📂 Expanded: '),
          span(`${expandedCount.get()} paths`),
        ),
      ),

      // Tree Component
      visibleNodes.get().length > 0
        ? TreeComponent({
            data: visibleNodes,
            collapsedPaths: collapsedPaths,
            onToggle: toggleNode,
            onSelect: (node) => {
              console.log('🎯 Node selected:', {
                node: node.name,
                id: node.id,
              });
              selectedNode.set(node);
            },
            selectedNode: selectedNode,
            searchTerm: searchTerm,
          })
        : div(
            { className: 'empty-state' },
            div({ className: 'icon' }, '🔍'),
            h3('No nodes found'),
            p(`No nodes match "${searchTerm.get()}"`),
          ),
    ),
  );
});

// Helper function for select options
function option(props: { value: string }, text: string): HTMLOptionElement {
  const option = document.createElement('option');
  option.value = props.value;
  option.textContent = text;
  return option;
}

// Mount the app
const app = document.getElementById('app');
if (app) {
  console.log('🚀 Mounting TreeApp to DOM element:', app);
  console.log('🚀 App element properties:', {
    id: app.id,
    className: app.className,
    tagName: app.tagName,
    children: app.children.length,
  });

  try {
    render(TreeApp, app);
    console.log('✅ TreeApp rendered successfully');

    // Test if the component actually rendered
    setTimeout(() => {
      console.log('🔍 DOM after render:', {
        appChildren: app.children.length,
        hasHeader: !!app.querySelector('.header'),
        hasControls: !!app.querySelector('.controls'),
        hasTreeContainer: !!app.querySelector('.tree-container'),
        testButton: app.querySelector('.test-btn'),
        treeNodes: app.querySelectorAll('.tree-node').length,
        toggleButtons: app.querySelectorAll('.tree-toggle').length,
      });
    }, 100);
  } catch (error) {
    console.error('❌ Error rendering TreeApp:', error);
  }
} else {
  console.error('❌ App element not found!');
}
