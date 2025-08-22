import { component, div, h1, p, render } from 'tacit-dom';
import styles from './styles.module.css';

// Simple tree node type
type TreeNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
};

// Enhanced tree data with more realistic structure
const treeData: TreeNode[] = [
  {
    id: 'root',
    name: 'Documents',
    type: 'folder',
    children: [
      {
        id: 'work',
        name: 'Work',
        type: 'folder',
        children: [
          {
            id: 'projects',
            name: 'Projects',
            type: 'folder',
            children: [
              { id: 'website', name: 'Website', type: 'folder' },
              { id: 'mobile-app', name: 'Mobile App', type: 'folder' },
              { id: 'presentation.pptx', name: 'Presentation.pptx', type: 'file' },
              { id: 'budget.xlsx', name: 'Budget.xlsx', type: 'file' },
            ],
          },
          {
            id: 'meetings',
            name: 'Meetings',
            type: 'folder',
            children: [
              { id: 'weekly-notes.txt', name: 'Weekly Notes.txt', type: 'file' },
              { id: 'action-items.docx', name: 'Action Items.docx', type: 'file' },
            ],
          },
          { id: 'resume.pdf', name: 'Resume.pdf', type: 'file' },
        ],
      },
      {
        id: 'personal',
        name: 'Personal',
        type: 'folder',
        children: [
          {
            id: 'photos',
            name: 'Photos',
            type: 'folder',
            children: [
              { id: 'vacation-2024', name: 'Vacation 2024', type: 'folder' },
              { id: 'family', name: 'Family', type: 'folder' },
              { id: 'IMG_001.jpg', name: 'IMG_001.jpg', type: 'file' },
              { id: 'IMG_002.jpg', name: 'IMG_002.jpg', type: 'file' },
            ],
          },
          {
            id: 'finance',
            name: 'Finance',
            type: 'folder',
            children: [
              { id: 'expenses.xlsx', name: 'Expenses.xlsx', type: 'file' },
              { id: 'budget-planning.xlsx', name: 'Budget Planning.xlsx', type: 'file' },
            ],
          },
        ],
      },
      {
        id: 'downloads',
        name: 'Downloads',
        type: 'folder',
        children: [
          { id: 'document.pdf', name: 'Document.pdf', type: 'file' },
          { id: 'image.png', name: 'Image.png', type: 'file' },
          { id: 'setup.exe', name: 'Setup.exe', type: 'file' },
        ],
      },
      { id: 'desktop.ini', name: 'Desktop.ini', type: 'file' },
    ],
  },
];

// Helper function to get appropriate icon for file type
function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return '📄';
    case 'docx':
    case 'doc':
      return '📝';
    case 'xlsx':
    case 'xls':
      return '📊';
    case 'pptx':
    case 'ppt':
      return '📈';
    case 'txt':
      return '📃';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'exe':
      return '⚙️';
    case 'ini':
      return '⚙️';
    default:
      return '📄';
  }
}

// Tree component
const TreeComponent = component<{ data: TreeNode[] }>(({ data }, utils) => {
  const collapsedPaths = utils.signal<Record<string, boolean>>({});

  function renderNode(node: TreeNode, path: string = '', depth: number = 0): HTMLElement {
    const currentPath = path ? `${path}/${node.id}` : node.id;
    const isCollapsed = collapsedPaths.get()[currentPath] || false;
    const hasChildren = node.children && node.children.length > 0;

    const nodeContent = div(
      {
        className: [styles.treeNode, styles[node.type], styles[`depth-${depth}`]],
        style: `--depth: ${depth}`,
      },
      // Toggle button for folders
      hasChildren
        ? div(
            {
              className: [styles.toggle, isCollapsed ? styles.collapsed : ''],
              onClick: (e: Event) => {
                e.stopPropagation();
                collapsedPaths.update((current) => ({
                  ...current,
                  [currentPath]: !current[currentPath],
                }));
              },
            },
            isCollapsed ? '▶' : '▼',
          )
        : div({ className: [styles.toggle, styles.placeholder] }, ''),

      // Node icon
      div({ className: [styles.icon, styles[node.type]] }, node.type === 'folder' ? '📁' : getFileIcon(node.name)),

      // Node name
      div({ className: styles.name }, node.name),

      // File count for folders
      hasChildren
        ? div({ className: styles.fileCount }, `${node.children!.length} item${node.children!.length !== 1 ? 's' : ''}`)
        : null,
    );

    if (!hasChildren) {
      return div({ className: styles.node }, nodeContent);
    }

    const children = div(
      { className: styles.children },
      ...node.children!.map((child) => renderNode(child, currentPath, depth + 1)),
    );

    return div({ className: styles.node }, nodeContent, isCollapsed ? null : children);
  }

  return div({ className: styles.tree }, ...data.map((node) => renderNode(node)));
});

// Main app component
const TreeApp = component(() => {
  return div(
    { className: styles.app },
    div(
      { className: styles.header },
      h1('📁 Tree Explorer'),
      p('Click folders to expand/collapse and navigate through the tree'),
      p('Built with Tacit-DOM - A React-like reactive library'),
    ),
    div({ className: styles.container }, TreeComponent({ data: treeData })),
  );
});

// Mount the app
const app = document.getElementById('app');
if (app) {
  render(TreeApp, app);
}
