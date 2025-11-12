const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Use jsdom environment for browser APIs
  testEnvironment: 'jest-environment-jsdom',
  
  // Setup files after the environment is set up
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapper for CSS modules and path aliases
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/jest/mocks/styleMock.js',

    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/jest/mocks/fileMock.js',

    // Handle path aliases (from tsconfig.json)
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Transform files
  transform: {
    // Use babel-jest to transpile files with the next/babel preset
    // which is available as an export from next/jest
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/tests/**/*.[jt]s?(x)',
    '**/test/**/*.[jt]s?(x)',
  ],
  
  // Root directory for tests
  roots: ['<rootDir>'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/tests/**',
  ],
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Coverage threshold - Set to 0% initially, increase as tests are added
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    // Gradually increase coverage for specific files as they're tested
    'lib/utils.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'components/StatBox.tsx': {
      branches: 60,
      functions: 100,
      lines: 60,
      statements: 60,
    },
  },
  
  // Load environment variables from .env.test
  setupFiles: ['<rootDir>/jest/env-setup.js'],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Ignore patterns (remove tests from ignore - we WANT to run tests)
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

