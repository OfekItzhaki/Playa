module.exports = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|react-native-mmkv|zustand|uuid)/)',
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
  collectCoverageFrom: [
    'services/**/*.ts',
    '!services/NotificationService.ts',
    '!services/BackgroundTaskService.ts',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    './services/ValidationService.ts': {
      branches: 80,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './services/StorageService.ts': {
      branches: 70,
      functions: 80,
      lines: 69,
      statements: 70,
    },
    './services/SchedulingService.ts': {
      branches: 70,
      functions: 55,
      lines: 70,
      statements: 68,
    },
    './services/DeepLinkService.ts': {
      branches: 60,
      functions: 60,
      lines: 64,
      statements: 65,
    },
  },
  testEnvironment: 'node',
};
