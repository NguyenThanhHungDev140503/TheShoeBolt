import { Logger } from '@nestjs/common';

/**
 * Jest setup file for unit tests
 * Suppresses NestJS logger output during test execution to reduce noise
 */

// Mock console methods to suppress logs during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Global test setup
beforeAll(() => {
  // Suppress console output during tests
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();

  // Override NestJS Logger to prevent logs
  Logger.overrideLogger({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  });
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});
