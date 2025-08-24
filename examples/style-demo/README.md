# Style Demo - Tacit-DOM

A comprehensive demonstration of Tacit-DOM's styling capabilities with CSS modules and theme support.

## Features

- **CSS Modules**: All styles are organized using CSS modules for better maintainability
- **Theme System**: Comprehensive light/dark theme with CSS custom properties
- **Reactive Styling**: Dynamic styles that respond to user interactions
- **Theme Toggle**: Interactive button to switch between light and dark modes
- **CSS Variables**: Demonstrates the power of CSS custom properties for theming

## Running the Demo

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

## What You'll See

### Theme Information

- Overview of CSS custom properties used in the demo
- Explanation of the theming system

### Theme-Aware Styles

- Elements that automatically adapt to the current theme
- Smooth transitions between light and dark modes

### Static Styles

- String-based styles with CSS variables
- Object-based styles with theme integration
- Mixed style properties with theme awareness

### Reactive Styles

- Dynamic styles that change based on user interactions
- Toggle between theme colors and fixed colors
- Size and rotation controls

### Mixed Styles

- RGB color mixer with theme support
- Interactive sliders for color control
- Option to enable/disable theme background effects

### Conditional Rendering

- Demonstrates falsy value filtering
- Interactive content toggles
- Theme-aware styling

### Theme Color Palette

- Visual showcase of all theme colors
- Automatic adaptation to current theme

## Theme System

The demo uses CSS custom properties (variables) to create a comprehensive theming system:

- **Light Theme**: Clean, bright interface with subtle shadows
- **Dark Theme**: Dark interface with enhanced contrast and deeper shadows
- **Smooth Transitions**: All theme changes include smooth animations
- **Consistent Colors**: Semantic color system (primary, secondary, success, warning, error, info)

## CSS Modules

All styles are organized using CSS modules:

- Scoped class names prevent conflicts
- Kebab-case naming convention
- Organized by component and functionality
- Easy to maintain and extend

## Technical Details

- Built with Tacit-DOM reactive library
- Uses Vite for fast development and building
- TypeScript for type safety
- CSS modules for style organization
- CSS custom properties for theming
