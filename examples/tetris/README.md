# Tacit-DOM Tetris Example

A classic Tetris game implementation using Tacit-DOM, demonstrating reactive state management, real-time game loops, and DOM manipulation.

## Features

- **Classic Tetris Gameplay**: All 7 standard tetromino pieces (I, O, T, S, Z, J, L)
- **Reactive Game State**: Built with Tacit-DOM signals for smooth, reactive updates
- **Progressive Difficulty**: Game speed increases with level progression
- **Score System**: Points based on lines cleared and current level
- **Pause/Resume**: Space bar toggles game state
- **Responsive Design**: Works on both desktop and mobile devices

## Controls

- **Arrow Keys**: Move tetromino left/right/down
- **Up Arrow / Z / X**: Rotate tetromino
- **C**: Hard drop (instant placement)
- **Space**: Pause/Resume game
- **Space** (Game Over): Start new game

## Game Mechanics

- **Line Clearing**: Complete rows disappear and award points
- **Level Progression**: Every 10 lines increases level and speed
- **Wall Kicks**: Advanced rotation system for better piece placement
- **Game Over Detection**: Prevents new pieces from spawning

## Technical Implementation

This example showcases several Tacit-DOM concepts:

- **Multiple Atomic Signals**: Separate signals for game board, current piece, score, etc.
- **Reactive Effects**: Automatic DOM updates when game state changes
- **Event Handling**: Keyboard input with proper cleanup
- **Component Composition**: Modular game components (board, next piece, overlay)
- **Real-time Updates**: Game loop with reactive timing

## Running the Example

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:

   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## Project Structure

```
examples/tetris/
├── main.ts              # Main game logic and components
├── styles.module.css    # Game styling with CSS modules
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
└── README.md            # This file
```

## Key Tacit-DOM Patterns Used

### State Management

```typescript
const gameBoard = signal<number[][]>(createEmptyBoard());
const currentPiece = signal<Tetromino | null>(null);
const score = signal<number>(0);
```

### Reactive Effects

```typescript
effect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle input
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
});
```

### Component Rendering

```typescript
function GameBoard() {
  const board = gameBoard.get();
  const piece = currentPiece.get();

  // Create reactive board cells
  return div({ className: styles.gameBoard }, ...cells);
}
```

## Game Architecture

The game follows a classic game loop pattern:

1. **Input Handling**: Keyboard events update game state
2. **Game Logic**: Piece movement, collision detection, line clearing
3. **State Updates**: Signals update reactive values
4. **Rendering**: DOM automatically updates based on state changes
5. **Timing**: Game loop controls piece dropping speed

## Performance Considerations

- **Efficient Rendering**: Only updates changed DOM elements
- **Memory Management**: Proper cleanup of event listeners and timers
- **Optimized Updates**: Batched state changes prevent unnecessary re-renders

## Browser Compatibility

- Modern browsers with ES2020 support
- Responsive design for mobile devices
- Touch-friendly controls (can be extended)

## Extending the Game

Potential enhancements:

- **Sound Effects**: Audio feedback for actions
- **High Score Persistence**: Local storage for best scores
- **Touch Controls**: Mobile gesture support
- **Multiplayer**: Network-based competitive play
- **Custom Themes**: Different visual styles

## Learning Objectives

This example demonstrates:

- Complex state management with multiple signals
- Real-time game development patterns
- Event handling and cleanup
- Component composition and reusability
- Performance optimization techniques
- Responsive design principles

Perfect for developers learning reactive programming concepts and game development with Tacit-DOM!
