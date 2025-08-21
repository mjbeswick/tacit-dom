# Tacit-DOM Stopwatch Example

A simple, reactive stopwatch built with Tacit-DOM that demonstrates reactive signals, computed values, and DOM manipulation.

## Features

- **Start/Stop Timer**: Control the stopwatch with start and stop buttons
- **Reset**: Reset the timer to zero and clear lap times
- **Lap Times**: Record lap times while the timer is running
- **Real-time Updates**: The display updates every 10ms for smooth timing
- **Responsive Design**: Modern, mobile-friendly UI with smooth animations

## How It Works

This example showcases several key Tacit-DOM concepts:

### Reactive Signals

- `isRunning`: Tracks whether the stopwatch is active
- `elapsedTime`: Stores the current elapsed time in milliseconds
- `startTime`: Records when the timer started
- `lapTimes`: Array of recorded lap times

### Computed Values

- `displayTime`: Formats the elapsed time into a readable MM:SS.ms format
- `formattedLapTimes`: Converts lap times into displayable format

### Effects

- Cleanup effect ensures the timer interval is properly cleared

### DOM Elements

- Uses Tacit-DOM factory functions (`div`, `button`, `h1`, etc.)
- Reactive attributes that update automatically when signals change
- Conditional rendering for lap times display

## Running the Example

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to the displayed URL

## Code Structure

The stopwatch is built as a single component function that returns the DOM structure. The timer logic is handled by:

- `startTimer()`: Begins the countdown and sets up the interval
- `stopTimer()`: Pauses the timer and clears the interval
- `resetTimer()`: Resets all state to initial values
- `recordLap()`: Records the current time as a lap

## Key Learning Points

1. **Signal Management**: How to create and manage multiple related signals
2. **Computed Values**: Using computed values for derived state and formatting
3. **Effects**: Proper cleanup of intervals and timers
4. **Reactive UI**: How the UI automatically updates when signals change
5. **Event Handling**: Managing user interactions with reactive state

## Browser Compatibility

This example uses modern JavaScript features and should work in all modern browsers that support ES2020+.
