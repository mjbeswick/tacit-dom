# Tacit-DOM TODO App Example

A modern, Apple Reminders-style TODO application built with Tacit-DOM, demonstrating reactive programming patterns with multiple signals and DOM manipulation.

## Features

- **Multiple Signal Architecture**: Uses separate signals for todos, lists, and UI state for better performance and organization
- **Smart Lists**: Built-in smart lists including Today, Scheduled, All, Completed, and High Priority
- **Priority System**: Visual priority indicators (🔴 High, 🟡 Medium, 🟢 Low)
- **Due Dates & Locations**: Support for due dates and location metadata
- **Custom Lists**: Multiple themed lists (Work, Personal, Shopping, Health) with colored indicators
- **Rich Todo Items**: Support for notes, priority levels, due dates, and location data
- **Modern UI Design**: Clean, Apple-inspired interface with smooth animations and hover effects
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Search Functionality**: Real-time search across todo text and notes
- **Completion Tracking**: Track completion dates and manage completed items
- **CSS Modules**: Scoped styling with modular CSS architecture

## Architecture

The app demonstrates several advanced Tacit-DOM patterns:

### Multiple Signals Architecture

- `todoItems`: Signal containing all todo items with rich metadata
- `todoLists`: Signal for custom list definitions with colors and icons
- `listTodoMapping`: Signal mapping list IDs to todo item IDs
- `activeListId`: Signal for currently selected list or smart list
- `searchQuery`: Signal for real-time search filtering
- `showCompleted`: Signal for toggling completed item visibility

### Smart Lists System

- Predefined smart lists with custom filter functions
- Dynamic counting and filtering based on todo properties
- Support for date-based filtering (Today, Scheduled)
- Priority-based filtering (High Priority)
- Status-based filtering (All, Completed)

### Computed Values

- `currentTodos`: Filtered todos based on active list, search, and completion status
- `currentList`: Current list information (smart list or custom list)
- `completedTodoCount`: Count of completed todos for the current context
- Smart list counts (`todayCount`, `scheduledCount`, etc.)

### Advanced Features

- Hierarchical todo organization with list mappings
- Rich todo metadata (priority, due dates, locations, notes)
- Smart filtering and search across multiple fields
- Visual priority indicators and due date/location badges
- Completion date tracking

### Effects

- Reactive re-rendering across multiple signals
- Efficient updates when any signal changes
- Automatic UI synchronization

### DOM Elements

- Component-based architecture with reusable functions
- Factory functions for creating HTML elements
- Reactive attributes and event handlers
- Conditional rendering based on signal values

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

   The `preinstall` script automatically links the local `tacit-dom` package.

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:

   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Project Structure

```
examples/todo/
├── index.html          # Main HTML file
├── main.ts            # Application logic and components
├── global.css         # Global CSS styles (reset, body, etc.)
├── styles.module.css  # CSS modules for component styling
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite build configuration
└── README.md          # This file
```

## Key Components

### TodoApp

Main application component that renders the sidebar and main content.

### Sidebar

Left navigation panel with search, smart lists, and custom lists.

### MainContent

Right panel displaying the active list's todos and management interface.

### TodoItem

Individual todo item with checkbox, text, notes, and action buttons.

## State Management

The app uses a single `appState` signal containing:

```typescript
type AppState = {
  lists: TodoList[]; // All todo lists
  activeListId: string; // Currently selected list
  searchQuery: string; // Search filter
  showCompleted: boolean; // Show/hide completed todos
};
```

## Styling

- **CSS Architecture**: Separated global styles from component-specific styles
- **Global CSS**: Reset styles, body defaults, and base typography
- **CSS Modules**: Scoped component styles prevent conflicts
- **Apple Design Language**: Clean, modern interface inspired by macOS
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Transitions**: Hover effects and state changes
- **Accessibility**: Proper focus states and keyboard navigation

## Browser Support

- Modern browsers with ES2020 support
- CSS Grid and Flexbox support required
- TypeScript compilation to ES2020

## Development

This example demonstrates:

1. **Signal Creation**: Creating reactive state with `signal()`
2. **Computed Values**: Deriving state with `computed()`
3. **Effects**: Side effects and re-rendering with `effect()`
4. **DOM Factory Functions**: Creating elements with `div()`, `button()`, etc.
5. **Event Handling**: Reactive event handlers
6. **Component Composition**: Building complex UIs from simple components

## Learn More

- [Tacit-DOM Documentation](../../docs/)
- [Signals Guide](../../docs/SIGNALS.md)
- [DOM Internals](../../docs/DOM_INTERNALS.md)
- [API Reference](../../docs/API.md)
