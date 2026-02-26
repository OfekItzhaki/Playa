# Playa Mobile App

Stay connected with the people who matter through scheduled messaging reminders.

## Overview

Playa is a React Native mobile application that helps users maintain relationships by scheduling message reminders for WhatsApp, SMS, and Instagram. The app generates local notifications that, when tapped, open the target messaging app with pre-filled content using deep linking.

## Features

- **Multi-Platform Support**: Schedule messages for WhatsApp, SMS, and Instagram
- **Flexible Scheduling**: Random frequency (1-10 messages/day) or fixed times
- **Message Templates**: Create and manage message pools for each contact
- **Clone Configuration**: Copy schedule and message settings between contacts
- **Queue Management**: View, edit, and manually trigger scheduled messages
- **Data Export/Import**: Backup and restore your data
- **Background Generation**: Automatic daily event generation

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand
- **Storage**: MMKV (encrypted)
- **Styling**: NativeWind (TailwindCSS)
- **Navigation**: Expo Router
- **Notifications**: Expo Notifications
- **Testing**: Jest, React Native Testing Library, fast-check

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd playa-mobile-app
npm install
```

### Development

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run property-based tests
npm run test:property

# Run with coverage
npm run test:coverage
```

### Linting

```bash
# Run ESLint
npx eslint .

# Fix auto-fixable issues
npx eslint . --fix
```

## Project Structure

```
playa-mobile-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── queue.tsx      # Scheduled messages
│   │   └── settings.tsx   # Settings
│   ├── modals/            # Modal screens
│   └── _layout.tsx        # Root layout
├── components/            # React components
│   ├── shared/           # Reusable UI components
│   └── *.tsx             # Feature-specific components
├── services/             # Business logic services
│   ├── StorageService.ts
│   ├── ValidationService.ts
│   ├── SchedulingService.ts
│   ├── NotificationService.ts
│   ├── DeepLinkService.ts
│   └── BackgroundTaskService.ts
├── stores/               # Zustand state stores
│   ├── RecipientStore.ts
│   ├── EventStore.ts
│   └── UIStore.ts
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── __tests__/           # Test files
    ├── unit/
    ├── property/
    └── helpers/
```

## Core Concepts

### Recipients

A recipient represents a contact with:
- Name and platform (WhatsApp/SMS/Instagram)
- Identifier (phone number or username)
- Schedule configuration (random or fixed)
- Message pool (templates)

### Scheduled Events

Events are generated daily based on recipient configurations:
- Random mode: N messages at random times (09:00-21:00)
- Fixed mode: Messages at specific times

### Notifications

Local notifications are scheduled for each event. When tapped, they:
1. Extract event data
2. Construct platform-specific deep link
3. Open target app with pre-filled message
4. Update event status to "sent"

### Deep Linking

Platform-specific URL schemes:
- WhatsApp: `whatsapp://send?phone={phone}&text={message}`
- SMS: `sms:{phone}?body={message}`
- Instagram: `instagram://user?username={username}`

## Configuration

### Environment Variables

No environment variables required for basic functionality.

### Storage

Data is stored locally using MMKV with encryption. Storage includes:
- Recipients
- Scheduled events
- Metadata (last generation date)

## Development Standards

### Code Style

- TypeScript strict mode (no `any` types)
- PascalCase for components
- camelCase for functions
- UPPER_SNAKE_CASE for constants
- Files under 200 lines
- Conventional commits

### Testing

- 80%+ code coverage target
- Unit tests for all services and stores
- Property-based tests for correctness properties
- Component tests for UI interactions

### Pre-commit Hooks

Husky runs linting and tests before each commit.

## Troubleshooting

### Notifications Not Working

1. Check notification permissions in device settings
2. Verify background task is registered
3. Check console for errors

### Deep Links Not Opening

1. Ensure target app is installed
2. Verify URL format is correct
3. Check platform-specific URL schemes

### Data Not Persisting

1. Check MMKV initialization
2. Verify storage permissions
3. Check for storage errors in console

## Contributing

1. Follow the coding standards
2. Write tests for new features
3. Ensure linting passes
4. Update documentation

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
