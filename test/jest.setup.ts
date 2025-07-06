import { Logger } from '@nestjs/common';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Helper function to colorize text
const colorize = (color: keyof typeof colors, text: string) =>
  `${colors[color]}${text}${colors.reset}`;

/**
 * Jest setup file for optimized test output
 * Provides controlled logging and improved test output formatting
 */

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;

// Environment-based logging control
const isVerbose = process.env.JEST_VERBOSE === 'true' || process.argv.includes('--verbose');
const isDebugMode = process.env.NODE_ENV === 'test-debug';

// Custom console methods with improved formatting
const createCustomConsole = () => ({
  log: (...args: any[]) => {
    if (isVerbose || isDebugMode) {
      originalConsoleLog(colorize('gray', '[TEST LOG]'), ...args);
    }
  },
  warn: (...args: any[]) => {
    if (isVerbose || isDebugMode) {
      originalConsoleWarn(colorize('yellow', '[TEST WARN]'), ...args);
    }
  },
  error: (...args: any[]) => {
    // Always show errors but format them better
    const errorMsg = args.join(' ');
    if (errorMsg.includes('ClerkSessionService') && !isDebugMode) {
      // Suppress expected service errors in normal mode
      return;
    }
    originalConsoleError(colorize('red', '[TEST ERROR]'), ...args);
  },
  info: (...args: any[]) => {
    if (isVerbose || isDebugMode) {
      originalConsoleInfo(colorize('blue', '[TEST INFO]'), ...args);
    }
  }
});

// Custom NestJS Logger with controlled output
const createCustomLogger = () => ({
  log: (message: string, context?: string) => {
    if (isVerbose || isDebugMode) {
      originalConsoleLog(colorize('green', `[${context || 'APP'}]`), message);
    }
  },
  error: (message: string, trace?: string, context?: string) => {
    // Filter out expected test errors
    if (message.includes('Failed to get sessions') ||
        message.includes('Failed to revoke session') ||
        message.includes('Authentication failed') ||
        message.includes('Session not found') ||
        message.includes('User not found')) {
      if (!isDebugMode) return; // Suppress in normal test mode
    }
    originalConsoleError(colorize('red', `[${context || 'ERROR'}]`), message);
    if (trace && isDebugMode) {
      originalConsoleError(colorize('red', 'Stack trace:'), trace);
    }
  },
  warn: (message: string, context?: string) => {
    if (isVerbose || isDebugMode) {
      originalConsoleWarn(colorize('yellow', `[${context || 'WARN'}]`), message);
    }
  },
  debug: (message: string, context?: string) => {
    if (isDebugMode) {
      originalConsoleLog(colorize('gray', `[${context || 'DEBUG'}]`), message);
    }
  },
  verbose: (message: string, context?: string) => {
    if (isDebugMode) {
      originalConsoleLog(colorize('gray', `[${context || 'VERBOSE'}]`), message);
    }
  }
});

// Global test setup
beforeAll(() => {
  // Apply custom console methods
  const customConsole = createCustomConsole();
  console.log = customConsole.log;
  console.warn = customConsole.warn;
  console.error = customConsole.error;
  console.info = customConsole.info;

  // Apply custom NestJS Logger
  Logger.overrideLogger(createCustomLogger());

  // Display test environment info
  if (isVerbose) {
    originalConsoleLog(colorize('cyan', '🧪 Test Environment Initialized'));
    originalConsoleLog(colorize('cyan', `📊 Verbose Mode: ${isVerbose}`));
    originalConsoleLog(colorize('cyan', `🐛 Debug Mode: ${isDebugMode}`));
  }
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  console.info = originalConsoleInfo;

  if (isVerbose) {
    originalConsoleLog(colorize('cyan', '✅ Test Environment Cleaned Up'));
  }
});
