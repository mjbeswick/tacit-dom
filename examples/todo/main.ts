import { button, computed, div, effect, h1, h3, input, li, ol, render, signal, span } from 'tacit-dom';
import styles from './styles.module.css';

// Types
type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
  dueDate?: string;
  location?: string;
  priority?: 'none' | 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
};

type TodoList = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

type SmartList = {
  id: string;
  name: string;
  icon: string;
  filter: (items: TodoItem[]) => TodoItem[];
};

// Multiple signals for different parts of the state
const todoItems = signal<TodoItem[]>([
  {
    id: '1',
    text: 'Forward Sue and Isabelle the building control response',
    completed: false,
    notes: 'Send the latest building control documents to Sue and Isabelle for review',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    text: 'Claim on-call time',
    completed: false,
    notes: 'Submit timesheet for weekend on-call work',
    priority: 'medium',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    text: 'Book dental appointment',
    completed: true,
    notes: 'Annual checkup and cleaning',
    priority: 'low',
    createdAt: new Date('2024-01-08'),
    completedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    text: 'Review quarterly budget',
    completed: false,
    notes: 'Check expenses and update projections',
    priority: 'high',
    dueDate: '2024-01-20',
    createdAt: new Date('2024-01-11'),
  },
  {
    id: '5',
    text: 'Call mom',
    completed: false,
    notes: 'Weekly check-in call',
    priority: 'medium',
    createdAt: new Date('2024-01-13'),
  },
  {
    id: '6',
    text: 'Buy groceries',
    completed: true,
    notes: 'Milk, bread, eggs, fruits',
    priority: 'medium',
    createdAt: new Date('2024-01-09'),
    completedAt: new Date('2024-01-12'),
  },
  {
    id: '7',
    text: 'Fix leaky faucet',
    completed: false,
    notes: 'Kitchen sink has been dripping',
    priority: 'medium',
    location: 'Kitchen',
    createdAt: new Date('2024-01-11'),
  },
  {
    id: '8',
    text: 'Prepare presentation for Monday',
    completed: false,
    notes: 'Quarterly results presentation for the board',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: new Date('2024-01-12'),
  },
]);

const todoLists = signal<TodoList[]>([
  { id: 'work', name: 'Work', color: '#007aff', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#ff9500', icon: '🏠' },
  { id: 'shopping', name: 'Shopping', color: '#34c759', icon: '🛒' },
  { id: 'health', name: 'Health', color: '#ff3b30', icon: '🏥' },
]);

const listTodoMapping = signal<{ [listId: string]: string[] }>({
  work: ['1', '2', '4', '8'],
  personal: ['5', '7'],
  shopping: ['6'],
  health: ['3'],
});

const activeListId = signal<string>('work');
const searchQuery = signal<string>('');
const showCompleted = signal<boolean>(false);

// Smart lists
const smartLists: SmartList[] = [
  {
    id: 'today',
    name: 'Today',
    icon: '📅',
    filter: (items) => {
      const today = new Date().toDateString();
      return items.filter(
        (todo) =>
          !todo.completed &&
          (todo.dueDate === new Date().toISOString().split('T')[0] || todo.createdAt.toDateString() === today),
      );
    },
  },
  {
    id: 'scheduled',
    name: 'Scheduled',
    icon: '🗓️',
    filter: (items) => items.filter((todo) => !todo.completed && todo.dueDate),
  },
  {
    id: 'all',
    name: 'All',
    icon: '📁',
    filter: (items) => items.filter((todo) => !todo.completed),
  },
  {
    id: 'completed',
    name: 'Completed',
    icon: '✅',
    filter: (items) => items.filter((todo) => todo.completed),
  },
  {
    id: 'high-priority',
    name: 'High Priority',
    icon: '🔴',
    filter: (items) => items.filter((todo) => !todo.completed && todo.priority === 'high'),
  },
];

// Computed values
const currentTodos = computed(() => {
  const allTodos = todoItems.get();
  const currentListId = activeListId.get();
  const query = searchQuery.get();
  const showCompletedValue = showCompleted.get();

  let todos: TodoItem[] = [];

  // Check if it's a smart list
  const smartList = smartLists.find((list) => list.id === currentListId);
  if (smartList) {
    todos = smartList.filter(allTodos);
  } else {
    // Regular list - get todos for this list
    const mapping = listTodoMapping.get();
    const todoIds = mapping[currentListId] || [];
    todos = allTodos.filter((todo) => todoIds.includes(todo.id));
  }

  // Apply search filter
  if (query) {
    todos = todos.filter(
      (todo) =>
        todo.text.toLowerCase().includes(query.toLowerCase()) ||
        (todo.notes && todo.notes.toLowerCase().includes(query.toLowerCase())),
    );
  }

  // Apply completion filter for regular lists (smart lists handle their own filtering)
  if (!smartList && !showCompletedValue) {
    todos = todos.filter((todo) => !todo.completed);
  }

  return todos;
});

const currentList = computed(() => {
  const currentListId = activeListId.get();
  const lists = todoLists.get();
  const smartList = smartLists.find((list) => list.id === currentListId);

  if (smartList) {
    return { id: smartList.id, name: smartList.name, color: '#007aff', icon: smartList.icon };
  }

  return lists.find((list) => list.id === currentListId);
});

const completedTodoCount = computed(() => {
  const currentListId = activeListId.get();
  const allTodos = todoItems.get();

  // For smart lists, use their filter
  const smartList = smartLists.find((list) => list.id === currentListId);
  if (smartList && smartList.id === 'completed') {
    return smartList.filter(allTodos).length;
  }

  // For regular lists
  const mapping = listTodoMapping.get();
  const todoIds = mapping[currentListId] || [];
  const listTodos = allTodos.filter((todo) => todoIds.includes(todo.id));
  return listTodos.filter((todo) => todo.completed).length;
});

// Computed values for smart list counts
const todayCount = computed(() => smartLists[0].filter(todoItems.get()).length);
const scheduledCount = computed(() => smartLists[1].filter(todoItems.get()).length);
const allTodosCount = computed(() => smartLists[2].filter(todoItems.get()).length);
const completedCountAll = computed(() => smartLists[3].filter(todoItems.get()).length);
const highPriorityCount = computed(() => smartLists[4].filter(todoItems.get()).length);

// Actions
function addTodo(text: string) {
  if (!text.trim()) return;

  const currentListId = activeListId.get();

  // Don't allow adding to smart lists
  if (smartLists.find((list) => list.id === currentListId)) {
    return;
  }

  const newTodo: TodoItem = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    priority: 'none',
    createdAt: new Date(),
  };

  // Add todo to items
  todoItems.set([...todoItems.get(), newTodo]);

  // Add todo ID to list mapping
  const mapping = listTodoMapping.get();
  const currentTodoIds = mapping[currentListId] || [];
  listTodoMapping.set({
    ...mapping,
    [currentListId]: [...currentTodoIds, newTodo.id],
  });
}

function toggleTodo(todoId: string) {
  const todos = todoItems.get();
  const updatedTodos = todos.map((todo) =>
    todo.id === todoId
      ? {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date() : undefined,
        }
      : todo,
  );
  todoItems.set(updatedTodos);
}

function clearCompleted() {
  const currentListId = activeListId.get();
  const mapping = listTodoMapping.get();
  const todos = todoItems.get();

  if (smartLists.find((list) => list.id === currentListId)) {
    // For smart lists, remove all completed todos
    const completedTodoIds = todos.filter((todo) => todo.completed).map((todo) => todo.id);
    const remainingTodos = todos.filter((todo) => !todo.completed);
    todoItems.set(remainingTodos);

    // Update all mappings to remove completed todo IDs
    const updatedMapping: { [listId: string]: string[] } = {};
    Object.keys(mapping).forEach((listId) => {
      updatedMapping[listId] = mapping[listId].filter((id) => !completedTodoIds.includes(id));
    });
    listTodoMapping.set(updatedMapping);
  } else {
    // For regular lists, only remove completed todos from this list
    const currentTodoIds = mapping[currentListId] || [];
    const listTodos = todos.filter((todo) => currentTodoIds.includes(todo.id));
    const completedIds = listTodos.filter((todo) => todo.completed).map((todo) => todo.id);

    // Remove completed todos from items
    const remainingTodos = todos.filter((todo) => !completedIds.includes(todo.id));
    todoItems.set(remainingTodos);

    // Update mapping
    const updatedMapping = {
      ...mapping,
      [currentListId]: currentTodoIds.filter((id) => !completedIds.includes(id)),
    };
    listTodoMapping.set(updatedMapping);
  }
}

function setActiveList(listId: string) {
  activeListId.set(listId);
}

function setSearchQuery(query: string) {
  searchQuery.set(query);
}

function toggleShowCompleted() {
  showCompleted.set(!showCompleted.get());
}

// Components
function SearchBar() {
  const currentQuery = searchQuery.get();

  return div(
    { className: styles.searchBar },
    span({ className: styles.searchIcon }, '🔍'),
    input({
      type: 'text',
      placeholder: 'Search',
      value: currentQuery,
      onInput: (e: Event) => setSearchQuery((e.target as HTMLInputElement).value),
      className: styles.searchInput,
    }),
  );
}

function SmartListButton(icon: string, label: string, count: number, isActive: boolean, onClick: () => void) {
  return button(
    {
      className: `${styles.smartListButton} ${isActive ? styles.active : ''}`,
      onClick: onClick,
    },
    span({ className: styles.smartListIcon }, icon),
    span({ className: styles.smartListLabel }, label),
    span({ className: styles.smartListCount }, count.toString()),
  );
}

function Sidebar() {
  const lists = todoLists.get();
  const currentActiveListId = activeListId.get();
  const mapping = listTodoMapping.get();
  const allTodos = todoItems.get();

  return div(
    { className: styles.sidebar },

    // Search
    SearchBar(),

    // Smart Lists
    div(
      { className: styles.smartLists },
      SmartListButton('📅', 'Today', todayCount.get(), currentActiveListId === 'today', () => setActiveList('today')),
      SmartListButton('🗓️', 'Scheduled', scheduledCount.get(), currentActiveListId === 'scheduled', () =>
        setActiveList('scheduled'),
      ),
      SmartListButton('📁', 'All', allTodosCount.get(), currentActiveListId === 'all', () => setActiveList('all')),
      SmartListButton('✅', 'Completed', completedCountAll.get(), currentActiveListId === 'completed', () =>
        setActiveList('completed'),
      ),
      SmartListButton('🔴', 'High Priority', highPriorityCount.get(), currentActiveListId === 'high-priority', () =>
        setActiveList('high-priority'),
      ),
    ),

    // My Lists
    div(
      { className: styles.myLists },
      h3('My Lists'),
      ...lists.map((list) => {
        const listTodoIds = mapping[list.id] || [];
        const listTodos = allTodos.filter((todo) => listTodoIds.includes(todo.id));
        const incompleteCount = listTodos.filter((todo) => !todo.completed).length;

        return button(
          {
            className: `${styles.listButton} ${list.id === currentActiveListId ? styles.active : ''}`,
            onClick: () => setActiveList(list.id),
          },
          span({ className: styles.listIcon }, list.icon),
          span({ className: styles.listName }, list.name),
          span(
            {
              className: styles.listCount,
              style: `background-color: ${list.color}`,
            },
            incompleteCount.toString(),
          ),
        );
      }),
    ),

    // Add List Button
    button({ className: styles.addListButton, onClick: () => {} }, '+ Add List'),
  );
}

function TodoItemComponent(todo: TodoItem) {
  const priorityEmoji =
    todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : todo.priority === 'low' ? '🟢' : '';

  return li(
    {
      className: `${styles.todoItem} ${todo.completed ? styles.completed : ''} ${todo.priority === 'high' ? styles.highPriority : ''}`,
    },

    // Checkbox
    button(
      {
        className: styles.todoCheckbox,
        onClick: () => toggleTodo(todo.id),
      },
      todo.completed ? '✓' : '',
    ),

    // Todo content
    div(
      { className: styles.todoContent },
      div(
        { className: styles.todoHeader },
        div({ className: styles.todoText }, todo.text),
        priorityEmoji && span({ className: styles.todoPriority }, priorityEmoji),
      ),
      todo.notes && div({ className: styles.todoNotes }, todo.notes),
      (todo.dueDate || todo.location) &&
        div(
          { className: styles.todoMeta },
          todo.dueDate && span({ className: styles.todoDueDate }, `📅 ${new Date(todo.dueDate).toLocaleDateString()}`),
          todo.location && span({ className: styles.todoLocation }, `📍 ${todo.location}`),
        ),
      div(
        { className: styles.todoActions },
        button(
          { className: styles.todoActionButton, onClick: () => {} },
          todo.dueDate ? '📅 Edit Date' : '📅 Add Date',
        ),
        button(
          { className: styles.todoActionButton, onClick: () => {} },
          todo.location ? '📍 Edit Location' : '📍 Add Location',
        ),
      ),
    ),

    // Info button
    button({ className: styles.todoInfo, onClick: () => {} }, 'ℹ'),
  );
}

function MainContent() {
  const list = currentList.get();
  const todos = currentTodos.get();
  const completedCount = completedTodoCount.get();

  if (!list) return div('No list selected');

  return div(
    { className: styles.mainContent },

    // Header
    div(
      { className: styles.header },
      h1({ className: styles.listTitle }, list.name),
      div(
        { className: styles.headerActions },
        button({ className: styles.addButton, onClick: () => {} }, '+'),
        span({ className: styles.todoCount }, todos.filter((t) => !t.completed).length.toString()),
        button({ className: styles.showButton, onClick: toggleShowCompleted }, 'Show'),
      ),
    ),

    // Completed summary
    completedCount > 0 &&
      div(
        { className: styles.completedSummary },
        span(`${completedCount} Completed`),
        button({ className: styles.clearButton, onClick: clearCompleted }, 'Clear'),
      ),

    // Todo list
    ol({ className: styles.todoList }, ...todos.map((todo) => TodoItemComponent(todo))),

    // Add new todo
    div(
      { className: styles.addTodo },
      input({
        type: 'text',
        placeholder: 'Add a new todo...',
        className: styles.addTodoInput,
        onKeyPress: (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            addTodo((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = '';
          }
        },
      }),
    ),
  );
}

function TodoApp() {
  return div({ className: styles.app }, Sidebar(), MainContent());
}

// Render the app
const app = document.getElementById('app');
if (app) {
  try {
    // Initial render
    render(TodoApp(), app);

    // Set up reactive re-rendering
    effect(() => {
      // Access the signals to trigger re-renders
      todoItems.get();
      todoLists.get();
      listTodoMapping.get();
      activeListId.get();
      searchQuery.get();
      showCompleted.get();

      // Re-render the app
      render(TodoApp(), app);
    });
  } catch (error) {
    console.error('Error rendering TODO app:', error);
  }
} else {
  console.error('App element not found!');
}
