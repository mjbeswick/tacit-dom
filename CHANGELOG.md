# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2024-12-19

### Fixed

- **Critical Bug Fix**: Fixed infinite loops in computed values when subscribers access the computed value during notification
- **Computed Value Stability**: Computed values now use async microtask-based notifications to prevent recursive call chains
- **Subscription Safety**: Subscribers can now safely call `.value` or `.get()` on computed values without causing infinite loops

### Changed

- **Computed Value Notifications**: Subscriber notifications are now scheduled using microtasks (`Promise.resolve().then()`) instead of immediate execution
- **Dependency Tracking**: Improved dependency tracking in computed values with better state management

### Technical Details

- Added `isComputing` flag to prevent recomputation during active computation
- Implemented async notification system using microtasks to break recursive call chains
- Enhanced state management for dirty flags and computation state
- Updated tests to account for new async notification timing

## [0.3.1] - 2024-12-19

### Added

- Initial release with core signal system
- DOM manipulation utilities
- Component system
- Router functionality
- Internationalization support
- Error boundary system

### Features

- Reactive signals and computed values
- Preact-like component API
- CSS modules support
- TypeScript support
- Comprehensive testing suite
