# Implementation Tasks: Playa Mobile App

## Overview

This document outlines the implementation tasks for the Playa mobile app, a React Native (Expo) application that helps users maintain relationships through scheduled messaging reminders. The implementation follows 6 iterative phases, building from project setup through to final polish.

**Tech Stack**: React Native (Expo), TypeScript, Zustand, @tanstack/react-query, MMKV, NativeWind, Expo Router, Expo Notifications, fast-check

**Testing Approach**: Dual strategy with unit tests (Jest + React Native Testing Library) and property-based tests (fast-check) for 80%+ code coverage

**Standards**: TypeScript strict mode, no `any` types, PascalCase for components, camelCase for functions, files under 200 lines, conventional commits, pre-commit hooks

---

## Phase 1: Setup & Project Structure

### Objective
Establish project foundation with tooling, types, services, and stores

- [x] 1. Initialize Expo project and install dependencies
  - Create new Expo project with TypeScript template
  - Install core dependencies: zustand, @tanstack/react-query, react-native-mmkv, expo-notifications, expo-router, nativewind, zod, uuid
  - Install dev dependencies: jest, @testing-library/react-native, fast-check, eslint, prettier, husky, lint-staged
  - Configure package.json scripts (dev, build, test, lint, test:unit, test:property, test:coverage)
  - _Requirements: 19.1, 19.2_

- [x] 2. Configure development tooling and code quality
  - Set up ESLint with strict configuration (no-any, no-explicit-any rules)
  - Configure Prettier for code formatting
  - Set up Husky pre-commit hooks for linting and testing
  - Configure lint-staged for staged files only
  - Enable TypeScript strict mode in tsconfig.json
  - Configure NativeWind for styling
  - _Requirements: 12.1, 12.5, 12.6, 12.7, 19.4_

- [x] 3. Create project folder structure
  - Create folders: app/(tabs), app/modals, components, components/shared, services, stores, types, utils, __tests__/unit, __tests__/property, __tests__/integration, __tests__/helpers, docs
  - Set up Expo Router file-based navigation structure
  - Create index files for clean imports
  - _Requirements: 10.2, 19.7_


- [x] 4. Define TypeScript interfaces and types
  - Create types/Recipient.ts with Recipient interface (id, name, platform, identifier, scheduleConfig, messagePool, isActive, createdAt, updatedAt)
  - Create types/ScheduledEvent.ts with ScheduledEvent interface (id, recipientId, recipientName, platform, identifier, message, scheduledTime, status, notificationId, createdAt, executedAt)
  - Create types/ScheduleConfig.ts with ScheduleConfig discriminated union (Random mode with frequency, Fixed mode with fixedTimes)
  - Define Platform, ScheduleMode, EventStatus type aliases
  - Create types/Storage.ts with StorageSchema interface
  - Create types/Forms.ts with RecipientFormData, RecipientFormErrors, CloneOptions interfaces
  - Export all types from types/index.ts
  - _Requirements: 12.2, 12.3_

- [x] 5. Implement ValidationService with Zod schemas
  - Create services/ValidationService.ts
  - Define phoneSchema for E.164 format validation (regex: ^\+[1-9]\d{1,14}$)
  - Define instagramUsernameSchema for alphanumeric + underscore + period (regex: ^[a-zA-Z0-9._]{1,30}$)
  - Define messageSchema for 1-500 character strings
  - Define scheduleConfigSchema as discriminated union (Random: frequency 1-10, Fixed: at least 1 time in HH:mm format)
  - Define recipientSchema with platform-specific identifier validation
  - Export validateRecipient function that returns errors or validated data
  - _Requirements: 1.6, 1.7, 2.2, 2.6, 3.2, 11.9_

- [ ]* 5.1 Write property tests for input validation (Property 2)
  - **Property 2: Input Validation Consistency**
  - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.2, 2.6, 3.2**
  - Create __tests__/property/validation.property.test.ts
  - Generate invalid recipients (empty names, invalid phone numbers, invalid Instagram usernames, messages > 500 chars, frequency outside 1-10, fixed mode with zero times)
  - Verify validation errors are raised with appropriate messages
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [x] 6. Implement StorageService with MMKV
  - Create services/StorageService.ts implementing IStorageService interface
  - Initialize MMKV instance with encryption key derived from device ID
  - Implement recipient operations: saveRecipient, getRecipient, getAllRecipients, deleteRecipient
  - Implement event operations: saveEvent, getEvent, getAllEvents, getEventsByDate, deleteEvent, saveEvents (bulk), deleteEventsByRecipient
  - Implement metadata operations: getLastGenerationDate, setLastGenerationDate
  - Implement export/import: exportData (returns JSON string), importData (validates and loads JSON), clearAllData
  - Add in-memory cache with write-through strategy for performance
  - Wrap all operations in try-catch with StorageError throwing
  - _Requirements: 1.8, 5.7, 9.1, 9.2, 9.3, 9.4, 9.7, 9.9, 9.10, 14.2, 14.5_

- [ ]* 6.1 Write property tests for persistence round-trip (Property 1)
  - **Property 1: Recipient Persistence Round-Trip**
  - **Validates: Requirements 1.8, 5.7, 9.2, 9.4**
  - Create __tests__/property/persistence.property.test.ts
  - Create arbitraries.ts with recipientArbitrary generator (random valid recipients)
  - Generate random recipients, persist with StorageService, retrieve, verify deep equality
  - Test all fields including nested ScheduleConfig and MessagePool
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4, 13.7_

- [ ]* 6.2 Write unit tests for StorageService
  - Create __tests__/unit/services/StorageService.test.ts
  - Test saveRecipient and getRecipient operations
  - Test getAllRecipients returns all stored recipients
  - Test deleteRecipient removes recipient
  - Test event CRUD operations
  - Test getEventsByDate filters correctly
  - Test exportData and importData round-trip
  - Test error handling for invalid data
  - _Requirements: 13.2_

- [x] 7. Create Zustand stores
  - Create stores/RecipientStore.ts with recipients state (Record<string, Recipient>)
  - Implement addRecipient, updateRecipient, deleteRecipient, cloneRecipient actions
  - Integrate with StorageService for persistence
  - Create stores/EventStore.ts with events state (Record<string, ScheduledEvent>)
  - Implement addEvents, updateEvent, deleteEvent, getEventsByDate actions
  - Integrate with StorageService for persistence
  - Create stores/UIStore.ts with isLoading, error, activeModal state
  - Implement setLoading, setError, openModal, closeModal actions
  - _Requirements: 9.5, 12.10_

- [ ]* 7.1 Write unit tests for Zustand stores
  - Create __tests__/unit/stores/RecipientStore.test.ts
  - Test addRecipient creates recipient and persists to storage
  - Test updateRecipient modifies recipient and persists
  - Test deleteRecipient removes recipient from state and storage
  - Create __tests__/unit/stores/EventStore.test.ts
  - Test addEvents adds multiple events
  - Test updateEvent modifies event status
  - Test getEventsByDate filters events correctly
  - _Requirements: 13.2_

- [x] 8. Set up testing infrastructure
  - Configure Jest for React Native with TypeScript
  - Create __tests__/helpers/mocks.ts with mock services and stores
  - Create __tests__/helpers/fixtures.ts with test data generators
  - Create __tests__/helpers/arbitraries.ts with fast-check generators (phoneArbitrary, instagramUsernameArbitrary, messageArbitrary, scheduleConfigArbitrary, recipientArbitrary, scheduledEventArbitrary)
  - Configure test coverage thresholds (80% overall, 90% services/stores)
  - Set up test scripts in package.json
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 9. Checkpoint - Verify Phase 1 completion
  - Ensure project builds successfully on iOS and Android
  - Verify all types defined with strict TypeScript (no `any` types)
  - Verify StorageService passes persistence round-trip property tests
  - Verify validation property tests pass
  - Verify zero linting errors
  - Verify pre-commit hooks execute successfully
  - Ask user if questions arise before proceeding to Phase 2

---

## Phase 2: Dashboard & Add Contact UI

### Objective
Implement recipient creation, editing, and display functionality with full validation

- [x] 10. Create Dashboard screen with navigation
  - Create app/(tabs)/_layout.tsx with tab navigator
  - Create app/(tabs)/index.tsx (Dashboard screen)
  - Add header with app name "Playa"
  - Set up Expo Router navigation
  - Add FAB (Floating Action Button) to open Add Recipient modal
  - Implement pull-to-refresh functionality
  - _Requirements: 10.2, 10.3, 10.5, 17.4_

- [x] 11. Implement RecipientCard component
  - Create components/RecipientCard.tsx
  - Display recipient name, platform icon, identifier (phone/username)
  - Show schedule config summary (e.g., "Random: 3/day" or "Fixed: 09:00, 14:00, 18:00")
  - Show message pool count (e.g., "5 messages")
  - Add action buttons: Edit, Delete, Clone
  - Implement platform-specific styling (WhatsApp green, SMS blue, Instagram purple)
  - Add accessibility labels for all interactive elements
  - Ensure minimum touch target size of 44x44 points
  - _Requirements: 1.9, 1.10, 1.11, 10.4, 16.1, 16.3_

- [ ]* 11.1 Write unit tests for RecipientCard
  - Create __tests__/unit/components/RecipientCard.test.tsx
  - Test component renders recipient name and platform
  - Test edit button calls onEdit with recipient ID
  - Test delete button calls onDelete with recipient ID
  - Test clone button calls onClone with recipient ID
  - Test accessibility labels are present
  - _Requirements: 13.3_

- [x] 12. Create shared UI components
  - Create components/shared/Button.tsx with primary, secondary, danger variants
  - Create components/shared/Input.tsx with validation error display
  - Create components/shared/Modal.tsx with slide-up animation
  - Create components/shared/EmptyState.tsx with icon, title, description
  - Style with NativeWind (Tailwind CSS)
  - Ensure all components support dark mode
  - Add accessibility labels and screen reader support
  - _Requirements: 10.1, 10.6, 10.9, 16.2, 17.10_


- [x] 13. Implement ScheduleConfigEditor component
  - Create components/ScheduleConfigEditor.tsx
  - Add toggle switch between Random and Fixed mode
  - For Random mode: Add frequency slider (1-10 messages per day) with value display
  - For Fixed mode: Add time picker list with add/remove time slots
  - Validate Fixed mode has at least one time configured
  - Display validation errors inline
  - Format times in HH:mm format
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.8_

- [ ]* 13.1 Write unit tests for ScheduleConfigEditor
  - Create __tests__/unit/components/ScheduleConfigEditor.test.tsx
  - Test toggle between Random and Fixed mode
  - Test frequency slider updates value
  - Test adding time slot in Fixed mode
  - Test removing time slot in Fixed mode
  - Test validation error when Fixed mode has zero times
  - _Requirements: 13.3_

- [x] 14. Implement MessagePoolEditor component
  - Create components/MessagePoolEditor.tsx
  - Add input field for new message template with character counter (max 500)
  - Display list of existing message templates
  - Add edit functionality for existing messages (inline editing)
  - Add delete button for each message with confirmation
  - Validate messages are non-empty and ≤ 500 characters
  - Display validation errors inline
  - Show message count (e.g., "5/100 messages")
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.7, 15.9_

- [ ]* 14.1 Write unit tests for MessagePoolEditor
  - Create __tests__/unit/components/MessagePoolEditor.test.tsx
  - Test adding new message to pool
  - Test editing existing message
  - Test deleting message from pool
  - Test validation for empty message
  - Test validation for message > 500 characters
  - Test character counter updates correctly
  - _Requirements: 13.3_

- [x] 15. Create Add/Edit Recipient modal
  - Create app/modals/add-recipient.tsx
  - Add form fields: name (text input), platform (radio buttons: WhatsApp/SMS/Instagram), identifier (text input with platform-specific placeholder)
  - Integrate ScheduleConfigEditor component
  - Integrate MessagePoolEditor component
  - Add "Import from..." button (opens CloneSelector modal)
  - Implement form validation using ValidationService
  - Display validation errors inline near each field
  - Add Save and Cancel buttons
  - Show loading state during save operation
  - Navigate back to Dashboard on successful save
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.10, 10.8, 11.9_

- [x] 16. Implement platform-specific identifier validation
  - Add conditional validation based on selected platform
  - For WhatsApp/SMS: Validate phone number in E.164 format, show error "Please enter a valid phone number with country code (e.g., +1234567890)"
  - For Instagram: Validate username format, show error "Instagram username can only contain letters, numbers, underscores, and periods"
  - Update placeholder text based on platform ("+1234567890" for phone, "username" for Instagram)
  - _Requirements: 1.6, 1.7, 11.1, 11.2_

- [x] 17. Connect Add/Edit Recipient modal to RecipientStore
  - Implement form submission handler
  - Call RecipientStore.addRecipient for new recipients
  - Call RecipientStore.updateRecipient for editing existing recipients
  - Generate UUID for new recipients
  - Set createdAt and updatedAt timestamps
  - Handle errors and display user-friendly messages
  - Show success toast notification on save
  - _Requirements: 1.8, 11.5, 11.6_

- [x] 18. Implement Dashboard recipient list display
  - Load recipients from RecipientStore on screen mount
  - Display recipients in scrollable list using FlashList for performance
  - Show RecipientCard for each recipient
  - Implement empty state when no recipients exist ("No contacts yet. Tap + to add your first contact.")
  - Show loading state during initial data fetch
  - Handle edit action (open modal with recipient data)
  - Handle delete action (show confirmation dialog, then delete)
  - _Requirements: 1.9, 10.4, 10.8, 10.9, 15.3_

- [ ]* 18.1 Write unit tests for Dashboard screen
  - Create __tests__/unit/screens/Dashboard.test.tsx
  - Test recipients load on mount
  - Test empty state displays when no recipients
  - Test FAB opens Add Recipient modal
  - Test edit action opens modal with recipient data
  - Test delete action shows confirmation and removes recipient
  - _Requirements: 13.3_

- [x] 19. Checkpoint - Verify Phase 2 completion
  - Ensure users can create recipients with all fields (name, platform, identifier, schedule config, message pool)
  - Verify validation works correctly for all inputs (phone numbers, Instagram usernames, messages)
  - Verify recipients display on Dashboard with correct information
  - Verify edit and delete functionality works
  - Verify all validation property tests pass (Property 2)
  - Verify component unit tests pass
  - Verify zero linting errors
  - Ask user if questions arise before proceeding to Phase 3

---

## Phase 3: Copy/Clone Feature

### Objective
Implement selective data copying between recipients for efficient configuration

- [x] 20. Create CloneSelector modal component
  - Create app/modals/clone-selector.tsx
  - Display list of existing recipients (exclude current recipient if editing)
  - Show recipient name and platform for each option
  - Add checkboxes for "Copy schedule configuration" and "Copy message pool"
  - Add Select and Cancel buttons
  - Implement selection state management
  - _Requirements: 4.2, 4.3, 4.4_

- [ ]* 20.1 Write unit tests for CloneSelector modal
  - Create __tests__/unit/modals/CloneSelector.test.tsx
  - Test modal displays list of recipients
  - Test checkboxes toggle correctly
  - Test Select button returns selected recipient and options
  - Test Cancel button closes modal without selection
  - _Requirements: 13.3_

- [x] 21. Implement clone logic in RecipientStore
  - Add cloneRecipient action to RecipientStore
  - Accept targetId, sourceId, and CloneOptions (copyScheduleConfig, copyMessagePool)
  - Fetch source and target recipients from storage
  - Deep clone ScheduleConfig if copyScheduleConfig is true (use JSON.parse(JSON.stringify()))
  - Clone MessagePool array if copyMessagePool is true (use spread operator)
  - Preserve target recipient's name and identifier
  - Update target recipient's updatedAt timestamp
  - Persist updated target recipient to storage
  - _Requirements: 4.5, 4.6, 4.7, 4.8_

- [ ]* 21.1 Write property tests for clone operations (Property 7)
  - **Property 7: Clone Feature Preservation**
  - **Validates: Requirements 4.5, 4.6, 4.7, 4.8**
  - Create __tests__/property/clone.property.test.ts
  - Generate random source and target recipients
  - Test all combinations: copyScheduleConfig only, copyMessagePool only, both, neither
  - Verify ScheduleConfig deep equality when copied
  - Verify MessagePool contains all source messages when copied
  - Verify target name and identifier are preserved
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4, 13.9_

- [ ]* 21.2 Write unit tests for clone logic
  - Create __tests__/unit/stores/RecipientStore.clone.test.ts
  - Test cloning schedule config only
  - Test cloning message pool only
  - Test cloning both schedule config and message pool
  - Test target recipient preserves name and identifier
  - Test error handling when source or target not found
  - _Requirements: 13.2_

- [x] 22. Integrate CloneSelector into Add/Edit Recipient modal
  - Add "Import from..." button to Add/Edit Recipient modal
  - Open CloneSelector modal when button is clicked
  - Receive selected recipient and clone options from CloneSelector
  - Call RecipientStore.cloneRecipient with selected options
  - Update form fields with cloned data
  - Show confirmation toast "Configuration imported from [recipient name]"
  - _Requirements: 4.1, 4.9_

- [x] 23. Checkpoint - Verify Phase 3 completion
  - Ensure users can select source recipient for cloning
  - Verify selective copying works correctly (config only, pool only, both)
  - Verify target recipient preserves name and identifier
  - Verify clone property tests pass (Property 7 - deep equality verification)
  - Verify UI provides clear feedback on successful clone
  - Verify zero linting errors
  - Ask user if questions arise before proceeding to Phase 4

---

## Phase 4: Scheduling Logic

### Objective
Implement event generation algorithms and queue management

- [x] 24. Implement SchedulingService with core algorithms
  - Create services/SchedulingService.ts implementing ISchedulingService interface
  - Implement generateRandomTimes function (frequency: number, date: string) → string[]
  - Use algorithm: generate N unique random minute offsets (0-719) between 09:00-21:00, convert to timestamps, sort chronologically
  - Implement generateEventsForRecipient function (recipient: Recipient, date: string) → ScheduledEvent[]
  - Check recipient.isActive and messagePool.length > 0, return empty array if invalid
  - Generate times based on scheduleConfig.mode (Random or Fixed)
  - For each time: generate UUID, randomly select message from pool, create ScheduledEvent with status "pending"
  - Check for duplicate events (same recipientId + scheduledTime), skip if exists
  - Implement generateDailyEvents function (date: string) → ScheduledEvent[]
  - Load all active recipients, call generateEventsForRecipient for each, flatten results
  - Implement validateScheduleConfig and canGenerateEvents helper functions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9_


- [ ]* 24.1 Write property tests for random schedule time bounds (Property 3)
  - **Property 3: Random Schedule Time Bounds**
  - **Validates: Requirements 2.3, 5.2**
  - Create __tests__/property/scheduling.property.test.ts
  - Generate recipients with random frequencies (1-10)
  - Run generateEventsForRecipient, verify count equals frequency
  - Verify all scheduledTime values fall between 09:00 and 21:00 local time
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 24.2 Write property tests for fixed schedule time matching (Property 4)
  - **Property 4: Fixed Schedule Time Matching**
  - **Validates: Requirements 5.3**
  - Generate recipients with Fixed mode and various time configurations
  - Run generateEventsForRecipient, verify exactly one event per fixed time
  - Verify event times match configured times exactly
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 24.3 Write property tests for message pool membership (Property 5)
  - **Property 5: Message Pool Membership**
  - **Validates: Requirements 3.8, 5.5**
  - Generate recipients with various message pools
  - Run generateEventsForRecipient, verify each event's message exists in source pool
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 24.4 Write property tests for empty message pool constraint (Property 6)
  - **Property 6: Empty Message Pool Constraint**
  - **Validates: Requirements 3.9, 5.9**
  - Create recipients with empty message pools
  - Run generateEventsForRecipient, verify zero events are created
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 24.5 Write property tests for unique event identifiers (Property 8)
  - **Property 8: Unique Event Identifiers**
  - **Validates: Requirements 5.4**
  - Generate large batches of events (100+)
  - Collect all event IDs, verify no duplicates (set size equals array length)
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 24.6 Write property tests for no duplicate events per recipient-time (Property 9)
  - **Property 9: No Duplicate Events Per Recipient-Time**
  - **Validates: Requirements 5.8**
  - Attempt to generate events multiple times for same recipient and time
  - Verify only one event exists per recipient-time combination
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 24.7 Write property tests for initial event status (Property 10)
  - **Property 10: Initial Event Status**
  - **Validates: Requirements 5.6**
  - Generate events and verify all have status === "pending" immediately after creation
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 24.8 Write unit tests for SchedulingService
  - Create __tests__/unit/services/SchedulingService.test.ts
  - Test generateRandomTimes returns correct count and sorted times
  - Test generateEventsForRecipient with Random mode
  - Test generateEventsForRecipient with Fixed mode
  - Test generateEventsForRecipient returns empty array for inactive recipient
  - Test generateEventsForRecipient returns empty array for empty message pool
  - Test generateDailyEvents processes all active recipients
  - Test duplicate prevention logic
  - _Requirements: 13.2_

- [x] 25. Create Queue screen with event list
  - Create app/(tabs)/queue.tsx
  - Load all pending events from EventStore on mount
  - Sort events chronologically by scheduledTime
  - Display events in virtualized list (FlashList)
  - Show empty state when no events ("No scheduled messages yet")
  - Implement pull-to-refresh
  - _Requirements: 6.1, 6.2, 10.9, 15.3_

- [x] 26. Implement ScheduledEventCard component
  - Create components/ScheduledEventCard.tsx
  - Display recipient name, platform icon, scheduled time (formatted as "Today 09:30 AM" or "Tomorrow 2:00 PM")
  - Display message content preview (first 100 characters)
  - Show status indicator (pending/sent/cancelled)
  - Add countdown timer for events within 30 minutes (e.g., "in 15 minutes")
  - Add action buttons: Edit message, Delete, Manual trigger
  - Style with platform-specific colors
  - Add accessibility labels
  - _Requirements: 6.3, 6.10, 17.7_

- [ ]* 26.1 Write unit tests for ScheduledEventCard
  - Create __tests__/unit/components/ScheduledEventCard.test.tsx
  - Test component renders event details correctly
  - Test countdown timer displays for imminent events
  - Test edit button calls onEdit with event ID
  - Test delete button calls onDelete with event ID
  - Test trigger button calls onTrigger with event ID
  - _Requirements: 13.3_

- [x] 27. Implement event editing and deletion in Queue screen
  - Add edit functionality: open inline editor or modal to modify message content
  - Validate edited message (1-500 characters)
  - Call EventStore.updateEvent to persist changes
  - Add delete functionality: show confirmation dialog "Delete this scheduled message?"
  - Call EventStore.deleteEvent to remove event
  - Update event status to "cancelled" (don't actually delete from storage for audit trail)
  - Show success toast on edit/delete
  - _Requirements: 6.4, 6.5, 6.6, 6.7_

- [ ]* 27.1 Write unit tests for Queue screen
  - Create __tests__/unit/screens/Queue.test.tsx
  - Test events load and display chronologically
  - Test empty state displays when no events
  - Test edit event updates message content
  - Test delete event shows confirmation and removes from list
  - Test pull-to-refresh reloads events
  - _Requirements: 13.3_

- [x] 28. Implement schedule regeneration on config change
  - When RecipientStore.updateRecipient is called and scheduleConfig changed, trigger regeneration
  - Call EventStore.deleteEventsByRecipient to remove all pending events for that recipient
  - Call SchedulingService.generateEventsForRecipient to create new events
  - Call EventStore.addEvents to persist new events
  - Show toast notification "Schedule updated, events regenerated"
  - _Requirements: 2.9_

- [ ]* 28.1 Write property tests for schedule config change regeneration (Property 13)
  - **Property 13: Schedule Config Change Regeneration**
  - **Validates: Requirements 2.9**
  - Create recipient with events, modify schedule config
  - Verify old events are removed and new events match new config (count, times)
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [x] 29. Implement daily event generation background task
  - Create services/BackgroundTaskService.ts
  - Use Expo Background Fetch and Task Manager
  - Define DAILY_GENERATION_TASK that runs at 00:00 daily
  - Task logic: get today's date, call SchedulingService.generateDailyEvents, persist events, update lastGenerationDate
  - Register task with minimumInterval: 24 hours, stopOnTerminate: false, startOnBoot: true
  - Implement fallback: on app open, check if lastGenerationDate < today, generate if needed
  - Handle errors gracefully, log failures
  - _Requirements: 5.1, 5.10_

- [x] 30. Checkpoint - Verify Phase 4 completion
  - Ensure events generate correctly for Random and Fixed modes
  - Verify all times fall within 09:00-21:00 bounds
  - Verify messages are selected from recipient's message pool
  - Verify empty pools produce zero events
  - Verify no duplicate events are created
  - Verify Queue displays events chronologically
  - Verify all scheduling property tests pass (Properties 3, 4, 5, 6, 8, 9, 10, 12, 13)
  - Verify unit tests pass
  - Verify zero linting errors
  - Ask user if questions arise before proceeding to Phase 5

---

## Phase 5: Execution & Deep Linking

### Objective
Implement notification scheduling and deep link execution for message sending

- [x] 31. Implement NotificationService with Expo Notifications
  - Create services/NotificationService.ts implementing INotificationService interface
  - Implement requestPermissions function using Expo Notifications API
  - Implement checkPermissions function to verify current permission status
  - Implement scheduleNotification function (event: ScheduledEvent) → string (notification ID)
  - Set notification content: title "Message for {recipientName}", body "{messagePreview}" (first 100 chars)
  - Set notification data: { eventId, recipientId }
  - Set trigger time from event.scheduledTime
  - Return notification ID from Expo Notifications
  - Implement cancelNotification function (notificationId: string)
  - Implement updateNotification function (notificationId: string, event: ScheduledEvent)
  - Implement scheduleNotifications batch function (events: ScheduledEvent[]) → Map<eventId, notificationId>
  - Implement cancelAllNotifications function
  - Handle platform differences (iOS 64 notification limit)
  - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 15.8_

- [x] 32. Request notification permissions on first launch
  - Add permission request flow to app initialization
  - Call NotificationService.requestPermissions on first app open
  - If permissions denied, show modal with instructions to enable in Settings
  - Provide deep link to app settings
  - Store permission status in UIStore
  - Show warning banner on Dashboard if permissions denied
  - _Requirements: 7.1, 7.2, 14.9_

- [ ]* 32.1 Write unit tests for NotificationService
  - Create __tests__/unit/services/NotificationService.test.ts
  - Mock Expo Notifications API
  - Test scheduleNotification creates notification with correct content and trigger
  - Test cancelNotification removes notification
  - Test updateNotification modifies notification content
  - Test scheduleNotifications handles batch operations
  - Test error handling for permission denial
  - _Requirements: 13.2, 13.8_

- [x] 33. Integrate notification scheduling with event generation
  - After SchedulingService.generateDailyEvents creates events, call NotificationService.scheduleNotifications
  - Store returned notification IDs in ScheduledEvent.notificationId field
  - Update events in EventStore with notification IDs
  - Handle scheduling failures gracefully (log error, mark event with error status)
  - Show notification status in Queue screen (scheduled, delivered, failed)
  - _Requirements: 7.3, 7.9_


- [x] 34. Implement DeepLinkService with URL construction
  - Create services/DeepLinkService.ts implementing IDeepLinkService interface
  - Implement constructDeepLink function (event: ScheduledEvent) → string
  - For WhatsApp: construct `whatsapp://send?phone={phone}&text={encodedMessage}`
  - For SMS: construct `sms:{phone}?body={encodedMessage}`
  - For Instagram: construct `instagram://user?username={username}`
  - Use encodeURIComponent() for message content
  - Preserve phone number format (E.164, no encoding)
  - Handle emojis and special characters correctly
  - Limit URL length to 2048 characters
  - Implement validateDeepLink function to check URL format and length
  - Implement canOpenURL function using Linking.canOpenURL()
  - Implement openDeepLink function using Linking.openURL()
  - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 14.3_

- [ ]* 34.1 Write property tests for deep link URL construction (Property 15)
  - **Property 15: Deep Link URL Construction**
  - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**
  - Create __tests__/property/deeplink.property.test.ts
  - Generate events with various platforms and messages (including special characters, emojis)
  - Construct deep links, verify URL format matches expected pattern
  - Verify message content is properly URL-encoded
  - Parse URLs and verify phone/username and message are preserved
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4, 13.5_

- [ ]* 34.2 Write unit tests for DeepLinkService
  - Create __tests__/unit/services/DeepLinkService.test.ts
  - Test constructDeepLink for WhatsApp with various messages
  - Test constructDeepLink for SMS with various messages
  - Test constructDeepLink for Instagram
  - Test URL encoding handles special characters (spaces, &, ?, #, emojis)
  - Test validateDeepLink rejects invalid URLs
  - Test validateDeepLink rejects URLs > 2048 characters
  - _Requirements: 13.2_

- [x] 35. Implement notification response handler
  - Set up notification response listener in app initialization
  - When notification is tapped, extract eventId from notification data
  - Call EventStore.getEvent(eventId) to retrieve event
  - Call DeepLinkService.constructDeepLink(event) to build URL
  - Call DeepLinkService.canOpenURL(url) to check if target app is installed
  - If installed, call DeepLinkService.openDeepLink(url)
  - If successful, update event status to "sent" and set executedAt timestamp
  - If app not installed, show error toast with app store link
  - If deep linking fails, log error and keep status as "pending"
  - _Requirements: 8.1, 8.6, 8.7, 8.8, 8.9_

- [x] 36. Add manual trigger functionality in Queue screen
  - Add "Open" button to ScheduledEventCard
  - When clicked, call notification response handler logic (construct deep link, open URL)
  - Allow users to manually trigger deep link without waiting for notification
  - Update event status to "sent" on successful trigger
  - Show error message if target app not installed
  - _Requirements: 8.10_

- [x] 37. Implement notification cancellation on event deletion
  - When EventStore.deleteEvent is called, check if event has notificationId
  - If notificationId exists, call NotificationService.cancelNotification(notificationId)
  - Update event status to "cancelled"
  - Handle cancellation failures gracefully (log error, continue with deletion)
  - _Requirements: 7.6_

- [ ]* 37.1 Write property tests for notification lifecycle consistency (Property 14)
  - **Property 14: Notification Lifecycle Consistency**
  - **Validates: Requirements 7.3, 7.4, 7.5, 7.6, 7.7**
  - Create events, verify notifications are scheduled with matching time and content
  - Delete events, verify associated notifications are cancelled
  - Edit event messages, verify notification content is updated
  - Verify event.notificationId matches scheduled notification ID
  - Use fast-check with 100+ iterations (mock notification system)
  - _Requirements: 13.4, 13.8_

- [ ]* 37.2 Write property tests for event status transitions (Property 11)
  - **Property 11: Event Status Transitions**
  - **Validates: Requirements 6.7, 8.8, 8.9**
  - Generate events in various states (pending, sent, cancelled)
  - Attempt all possible transitions: pending→sent, pending→cancelled, sent→pending (invalid), cancelled→pending (invalid)
  - Verify only valid transitions succeed (pending→sent, pending→cancelled)
  - Verify invalid transitions are rejected
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 37.3 Write property tests for chronological event sorting (Property 12)
  - **Property 12: Chronological Event Sorting**
  - **Validates: Requirements 6.2**
  - Generate random lists of events with random scheduledTime values
  - Sort events chronologically
  - Verify pairwise ordering: events[i].scheduledTime <= events[i+1].scheduledTime for all i
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [ ]* 37.4 Write integration tests for full notification execution flow
  - Create __tests__/integration/notification-execution.test.ts
  - Test complete flow: create recipient → generate events → schedule notifications → trigger notification → open deep link → update status
  - Mock Expo Notifications and Linking APIs
  - Verify event status updates to "sent"
  - Verify notification is cancelled after execution
  - Test error handling when app not installed
  - _Requirements: 13.3_

- [x] 38. Checkpoint - Verify Phase 5 completion
  - Ensure notifications schedule correctly for all events
  - Verify tapping notification opens target app with pre-filled content
  - Verify event status updates to "sent" after successful execution
  - Verify deep link URLs are correctly formatted for all platforms
  - Verify URL encoding handles special characters and emojis
  - Verify error messages display when target app not installed
  - Verify all notification and deep link property tests pass (Properties 11, 14, 15)
  - Verify integration tests pass
  - Verify zero linting errors
  - Ask user if questions arise before proceeding to Phase 6

---

## Phase 6: Polish & Additional Features

### Objective
Add remaining features, polish UX, complete testing, and finalize documentation

- [x] 39. Implement data export functionality
  - Add "Export Data" button to Settings screen
  - Call StorageService.exportData() to get JSON string
  - Use Expo FileSystem to save JSON to device storage
  - Show file picker to let user choose save location
  - Show success toast with file path
  - Add warning message: "Exported file contains sensitive data. Store securely."
  - _Requirements: 9.9_

- [x] 40. Implement data import functionality
  - Add "Import Data" button to Settings screen
  - Show file picker to let user select JSON file
  - Read file content using Expo FileSystem
  - Validate JSON structure matches StorageSchema
  - Show confirmation dialog: "This will replace all existing data. Continue?"
  - Call StorageService.importData(jsonData) to load data
  - Reload stores from storage
  - Show success toast "Data imported successfully"
  - Handle validation errors with clear messages
  - _Requirements: 9.10_

- [ ]* 40.1 Write property tests for export/import round-trip (Property 16)
  - **Property 16: Data Export/Import Round-Trip**
  - **Validates: Requirements 9.9, 9.10**
  - Generate random application state (recipients and events)
  - Export to JSON, clear state, import from JSON
  - Verify deep equality of all recipients and events after import
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [x] 41. Implement input sanitization
  - Create utils/sanitize.ts with sanitizeInput function
  - Remove leading/trailing whitespace
  - Remove control characters (regex: /[\x00-\x1F\x7F]/g)
  - Escape HTML special characters (< > & " ')
  - Limit string length to specified maximum
  - Apply sanitization to all user inputs before storage (names, messages, identifiers)
  - Apply sanitization before constructing deep links
  - _Requirements: 14.2, 14.3, 14.4_

- [ ]* 41.1 Write property tests for input sanitization (Property 17)
  - **Property 17: Input Sanitization**
  - **Validates: Requirements 14.2, 14.3**
  - Generate strings with various special characters, HTML tags, control characters
  - Sanitize inputs, verify dangerous content is escaped
  - Verify valid Unicode characters are preserved
  - Verify leading/trailing whitespace is removed
  - Verify length constraints are enforced
  - Use fast-check with 100+ iterations
  - _Requirements: 13.4_

- [x] 42. Implement dark mode support
  - Configure NativeWind for dark mode based on system preferences
  - Define color scheme in tailwind.config.js (light and dark variants)
  - Update all components to use theme-aware colors
  - Test all screens in both light and dark mode
  - Ensure sufficient color contrast in both modes (WCAG AA standard)
  - _Requirements: 16.4, 17.10_

- [x] 43. Add accessibility enhancements
  - Add accessibility labels to all interactive elements (buttons, inputs, cards)
  - Add accessibility hints for complex interactions
  - Group related form fields with proper labels
  - Announce state changes to screen readers (e.g., "Recipient created", "Event deleted")
  - Test with VoiceOver (iOS) and TalkBack (Android)
  - Verify minimum touch target size of 44x44 points for all buttons
  - Support dynamic text sizing
  - Provide alternative text for icons
  - _Requirements: 16.1, 16.2, 16.3, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10_

- [x] 44. Implement Settings screen
  - Create app/(tabs)/settings.tsx
  - Add "Export Data" button
  - Add "Import Data" button
  - Add "Clear All Data" button with confirmation dialog
  - Display app version and build number
  - Add "About" section with app description
  - Add "Permissions" section showing notification permission status with link to settings
  - Add "Help" section with troubleshooting tips
  - _Requirements: 14.7, 18.9_

- [x] 45. Add loading and error states throughout app
  - Implement loading spinners for async operations (data fetch, save, delete)
  - Add skeleton loaders for Dashboard and Queue screens during initial load
  - Implement error boundaries for React component errors
  - Show user-friendly error messages for all error types (validation, storage, notification, deep link)
  - Use toast notifications for transient messages (success, info)
  - Use modal dialogs for critical errors requiring user action
  - Never display technical error details (stack traces) to users
  - _Requirements: 10.8, 11.1, 11.2, 11.3, 11.7, 11.10_

- [x] 46. Implement confirmation dialogs
  - Add confirmation dialog for recipient deletion: "Delete [name]? This will also delete all scheduled messages."
  - Add confirmation dialog for event deletion: "Delete this scheduled message?"
  - Add confirmation dialog for clear all data: "This will permanently delete all recipients and messages. This cannot be undone."
  - Add confirmation dialog for data import: "This will replace all existing data. Continue?"
  - Use platform-appropriate dialog styles (iOS Alert, Android AlertDialog)
  - _Requirements: 1.11, 6.5, 6.9, 14.7_


- [x] 47. Add onboarding tutorial for first-time users
  - Create onboarding flow with 3-4 screens explaining core features
  - Screen 1: Welcome to Playa - "Stay connected with the people who matter"
  - Screen 2: How it works - "Schedule messages, get reminders, send with one tap"
  - Screen 3: Platforms - "Works with WhatsApp, SMS, and Instagram"
  - Screen 4: Privacy - "All data stays on your device. No cloud, no tracking."
  - Show onboarding only on first app launch
  - Store onboarding completion status in storage
  - Add "Skip" button to skip onboarding
  - _Requirements: 18.4_

- [x] 48. Implement performance optimizations
  - Use React.memo for RecipientCard and ScheduledEventCard components
  - Use useMemo for sorted event lists and filtered data
  - Use useCallback for event handlers passed to child components
  - Implement lazy loading for Settings screen
  - Use FlashList instead of FlatList for recipient and event lists
  - Debounce search/filter inputs (300ms delay)
  - Implement optimistic updates for edit/delete operations using React Query
  - Batch notification scheduling operations
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

- [x] 49. Add platform-specific enhancements
  - Handle safe area insets on iOS devices with notches (use SafeAreaView)
  - Use platform-appropriate UI components (iOS modals, Android bottom sheets)
  - Implement platform-specific haptic feedback for button presses
  - Handle platform-specific date/time formatting
  - Test notification scheduling on both iOS and Android (handle iOS 64 notification limit)
  - Test deep linking on both platforms
  - Handle platform-specific permission flows
  - _Requirements: 17.1, 17.2, 17.3, 17.5, 17.6, 17.7, 17.8, 17.9_

- [x] 50. Write comprehensive documentation
  - Create README.md with project overview, setup instructions, and development workflow
  - Document all environment variables and configuration options
  - Create docs/architecture.md explaining system design, data flow, and component hierarchy
  - Create docs/api.md documenting all service interfaces and functions
  - Create docs/testing.md explaining testing strategy, how to run tests, and how to write new tests
  - Add JSDoc comments to all public functions and interfaces
  - Document deep linking schemas for each platform
  - Create troubleshooting guide for common issues (permissions, app not installed, notification limits)
  - Document iterative development roadmap and phase completion criteria
  - _Requirements: 18.1, 18.2, 18.3, 18.6, 18.8, 18.9, 18.10_

- [x] 51. Create example data for testing
  - Create utils/mockData.ts with example recipients and message templates
  - Add "Load Example Data" button in Settings (development mode only)
  - Generate 5-10 example recipients with various configurations (Random/Fixed, WhatsApp/SMS/Instagram)
  - Include diverse message templates (greetings, check-ins, questions)
  - Useful for manual testing and demos
  - _Requirements: 18.7_

- [x] 52. Implement error logging and crash reporting
  - Create utils/logger.ts with structured logging
  - Log all errors with timestamp, level, category, message, and context
  - In development: log to console with full stack traces
  - In production: log errors without sensitive data (no phone numbers, messages)
  - Implement global error handler for uncaught exceptions
  - Consider adding crash reporting service (Sentry) in future
  - _Requirements: 5.10, 7.8, 8.9, 9.7, 11.3, 14.4_

- [x] 53. Run comprehensive manual testing
  - Test complete recipient lifecycle: create, edit, delete
  - Test clone feature with all combinations
  - Test event generation for Random and Fixed modes
  - Test notification scheduling and triggering
  - Test deep linking to WhatsApp, SMS, Instagram
  - Test error scenarios: permissions denied, app not installed, invalid data
  - Test data export and import
  - Test on both iOS and Android devices
  - Test in light and dark mode
  - Test with screen readers (VoiceOver, TalkBack)
  - Test with various text sizes (accessibility)
  - _Requirements: 17.6_

- [x] 54. Verify all property-based tests pass
  - Run all 17 property tests with 100+ iterations each
  - Property 1: Recipient Persistence Round-Trip
  - Property 2: Input Validation Consistency
  - Property 3: Random Schedule Time Bounds
  - Property 4: Fixed Schedule Time Matching
  - Property 5: Message Pool Membership
  - Property 6: Empty Message Pool Constraint
  - Property 7: Clone Feature Preservation
  - Property 8: Unique Event Identifiers
  - Property 9: No Duplicate Events Per Recipient-Time
  - Property 10: Initial Event Status
  - Property 11: Event Status Transitions
  - Property 12: Chronological Event Sorting
  - Property 13: Schedule Config Change Regeneration
  - Property 14: Notification Lifecycle Consistency
  - Property 15: Deep Link URL Construction
  - Property 16: Data Export/Import Round-Trip
  - Property 17: Input Sanitization
  - Verify all tests pass consistently
  - _Requirements: 13.4_

- [ ] 55. Verify code coverage meets targets
  - Run test coverage report: npm run test:coverage
  - Verify overall code coverage ≥ 80%
  - Verify business logic (services) coverage ≥ 90%
  - Verify stores coverage ≥ 90%
  - Verify components coverage ≥ 70%
  - Identify and test any uncovered critical paths
  - _Requirements: 13.1_

- [x] 56. Perform code quality audit
  - Run ESLint and fix all errors and warnings
  - Verify no `any` types in codebase (except auto-generated code)
  - Verify all files under 200 lines of code (split large files)
  - Verify consistent naming conventions (PascalCase for components, camelCase for functions, UPPER_SNAKE_CASE for constants)
  - Verify all business logic extracted into service modules
  - Verify dependency injection patterns used for services
  - Run Prettier to format all code
  - _Requirements: 12.1, 12.3, 12.4, 12.8, 12.9, 12.10_

- [ ] 57. Build and test production releases
  - Configure Expo EAS for building production releases
  - Build iOS release (TestFlight or App Store)
  - Build Android release (APK or AAB for Play Store)
  - Test production builds on physical devices
  - Verify code obfuscation is enabled
  - Verify console.logs are removed in production
  - Verify app performance meets targets (launch < 500ms, dashboard render < 300ms)
  - _Requirements: 15.1, 19.10_

- [x] 58. Final checkpoint - Verify all requirements met
  - Review all 20 requirements and verify implementation
  - Verify all 17 correctness properties have passing property tests
  - Verify 80%+ code coverage achieved
  - Verify zero linting errors
  - Verify successful builds on both iOS and Android
  - Verify manual testing confirms all user flows work end-to-end
  - Verify app successfully schedules notifications and opens target apps with pre-filled messages
  - Verify data persists correctly across app restarts
  - Verify clone feature successfully copies configurations between recipients
  - Verify all 6 iterative development phases are complete
  - Verify documentation is comprehensive and up-to-date
  - Ask user for final validation and approval

---

## Notes

### Task Conventions

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability (e.g., _Requirements: 1.1, 1.2_)
- Property-based test tasks explicitly reference their property number and validated requirements
- Checkpoint tasks ensure incremental validation before proceeding to next phase

### Testing Strategy

- **Unit Tests**: Verify specific examples, edge cases, and error conditions for components and services
- **Property-Based Tests**: Verify universal properties across all inputs using fast-check (100+ iterations per property)
- **Integration Tests**: Verify complete flows across multiple components and services
- Both approaches are complementary and necessary for comprehensive coverage

### Implementation Order

Follow the 6 phases sequentially:
1. **Phase 1**: Foundation (types, services, stores, testing infrastructure)
2. **Phase 2**: UI for recipient management (Dashboard, forms, validation)
3. **Phase 3**: Clone feature (selective data copying)
4. **Phase 4**: Scheduling logic (event generation, queue management)
5. **Phase 5**: Execution (notifications, deep linking)
6. **Phase 6**: Polish (export/import, accessibility, documentation, final testing)

Each phase builds on the previous phase and includes checkpoint tasks for validation.

### Code Quality Standards

- TypeScript strict mode with no `any` types
- PascalCase for components, camelCase for functions/variables, UPPER_SNAKE_CASE for constants
- Files under 200 lines of code
- Conventional commits (feat/fix/chore/refactor/docs/test)
- ESLint + Prettier with pre-commit hooks
- Comprehensive JSDoc documentation
- 80%+ code coverage on business logic

### Property-Based Testing Format

Each property test must follow this format:
```typescript
describe('Feature: playa-mobile-app, Property N: [Property Title]', () => {
  it('should [property description]', () => {
    fc.assert(
      fc.property(arbitrary, (input) => {
        // Test implementation
      }),
      { numRuns: 100 }
    );
  });
});
```

### Success Criteria

The Playa mobile app MVP will be considered complete when:
- All 20 requirements are implemented and tested
- All 17 correctness properties pass property-based tests
- 80%+ code coverage achieved on business logic
- Zero linting errors and successful builds on both iOS and Android
- Manual testing confirms all user flows work end-to-end
- App successfully schedules notifications and opens target apps with pre-filled messages
- Data persists correctly across app restarts
- Clone feature successfully copies configurations between recipients
- All 6 iterative development phases are complete
- Documentation is comprehensive and up-to-date

---

_Implementation Tasks Document Version 1.0_  
_Created: February 2026_  
_Spec ID: 51c7d871-8556-42f2-8b9b-db0a93779bc5_
