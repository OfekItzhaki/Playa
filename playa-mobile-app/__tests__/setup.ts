/// <reference types="jest" />

// Mock React Native
jest.mock('react-native', () => ({
  Linking: {
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openURL: jest.fn(() => Promise.resolve()),
    openSettings: jest.fn(() => Promise.resolve()),
  },
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

// Mock MMKV with in-memory storage
let mockStorage: Record<string, string> = {};

// Export function to clear storage between tests
export function clearMockStorage() {
  // Clear the object properties instead of reassigning
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  // Also clear StorageService cache
  try {
    const StorageService = require('../services/StorageService');
    if (StorageService.clearCache) {
      StorageService.clearCache();
    }
  } catch (_e) {
    // Ignore if StorageService not available
  }
}

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    getString: jest.fn((key: string) => mockStorage[key]),
    clearAll: jest.fn(() => {
      // Clear the object properties instead of reassigning
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    }),
  })),
}));

// Mock Expo modules
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
