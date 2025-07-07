/**
 * Error Formatter Utility
 * Formats Jest error messages for better readability
 */

class ErrorFormatter {
  constructor() {
    // ANSI color codes
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m'
    };
  }

  colorize(color, text) {
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  /**
   * Extract meaningful error information from Jest failure message
   */
  parseErrorMessage(failureMessage) {
    if (!failureMessage) return null;

    const lines = failureMessage.split('\n');
    let errorInfo = {
      errorName: 'Unknown Error',
      errorCode: null,
      errorMessage: '',
      fileName: '',
      lineNumber: null,
      columnNumber: null,
      testLocation: '',
      expectation: '',
      received: '',
      expected: ''
    };

    // Parse different types of errors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Extract error name and message (first line usually)
      if (i === 0 && line.includes(':')) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          errorInfo.errorName = parts[0].trim();
          errorInfo.errorMessage = parts.slice(1).join(':').trim();
        }
      }

      // Extract error code from message
      if (line.includes('Error') && /\d{3}/.test(line)) {
        const codeMatch = line.match(/(\d{3})/);
        if (codeMatch) {
          errorInfo.errorCode = codeMatch[1];
        }
      }

      // Extract file location and line number
      if (line.includes('.spec.ts:') || line.includes('.test.ts:')) {
        const locationMatch = line.match(/([^\/]+\.spec\.ts|[^\/]+\.test\.ts):(\d+):(\d+)/);
        if (locationMatch) {
          errorInfo.fileName = locationMatch[1];
          errorInfo.lineNumber = parseInt(locationMatch[2]);
          errorInfo.columnNumber = parseInt(locationMatch[3]);
        }

        // Extract full path for test location
        const pathMatch = line.match(/\(([^)]+\.spec\.ts|[^)]+\.test\.ts):(\d+):(\d+)\)/);
        if (pathMatch) {
          errorInfo.testLocation = pathMatch[1].replace(process.cwd(), '').replace(/^\//, '');
        }
      }

      // Extract Jest expectation details
      if (line.includes('Expected:')) {
        errorInfo.expected = lines[i + 1]?.trim() || '';
      }
      if (line.includes('Received:')) {
        errorInfo.received = lines[i + 1]?.trim() || '';
      }
      if (line.includes('expect(')) {
        errorInfo.expectation = line;
      }
    }

    return errorInfo;
  }

  /**
   * Format error for display
   */
  formatError(failedTest, options = {}) {
    const { showStackTrace = false, maxWidth = 80 } = options;
    
    if (!failedTest.failureMessages || failedTest.failureMessages.length === 0) {
      return this.colorize('red', '❌ Test failed without error details');
    }

    const errorInfo = this.parseErrorMessage(failedTest.failureMessages[0]);
    if (!errorInfo) {
      return this.colorize('red', '❌ Unable to parse error information');
    }

    let output = [];

    // Header with test name
    output.push(this.colorize('red', `❌ FAILED: ${failedTest.fullName}`));
    
    // Error summary line
    const errorSummary = this.formatErrorSummary(errorInfo);
    output.push(`   ${errorSummary}`);

    // Location information
    if (errorInfo.fileName && errorInfo.lineNumber) {
      const location = `📍 ${errorInfo.fileName}:${errorInfo.lineNumber}`;
      if (errorInfo.columnNumber) {
        output.push(`   ${this.colorize('blue', location)}:${errorInfo.columnNumber}`);
      } else {
        output.push(`   ${this.colorize('blue', location)}`);
      }
    }

    // Error details
    if (errorInfo.expectation) {
      output.push(`   ${this.colorize('gray', '💭 Expectation:')} ${errorInfo.expectation}`);
    }

    if (errorInfo.expected && errorInfo.received) {
      output.push(`   ${this.colorize('green', '✓ Expected:')} ${this.truncateText(errorInfo.expected, maxWidth - 15)}`);
      output.push(`   ${this.colorize('red', '✗ Received:')} ${this.truncateText(errorInfo.received, maxWidth - 15)}`);
    }

    // Stack trace (if requested)
    if (showStackTrace) {
      output.push(`   ${this.colorize('gray', '📚 Stack trace:')}`);
      const stackLines = failedTest.failureMessages[0].split('\n')
        .filter(line => line.includes('.spec.ts:') || line.includes('.test.ts:'))
        .slice(0, 3); // Show only first 3 relevant stack lines
      
      stackLines.forEach(line => {
        const cleanLine = line.trim().replace(process.cwd(), '');
        output.push(`     ${this.colorize('dim', cleanLine)}`);
      });
    }

    return output.join('\n');
  }

  /**
   * Format error summary with icon and color coding
   */
  formatErrorSummary(errorInfo) {
    let icon = '🚨';
    let color = 'red';

    // Categorize errors by type
    if (errorInfo.errorCode) {
      switch (errorInfo.errorCode) {
        case '401':
          icon = '🔐';
          color = 'yellow';
          break;
        case '403':
          icon = '🚫';
          color = 'red';
          break;
        case '404':
          icon = '🔍';
          color = 'blue';
          break;
        case '500':
          icon = '💥';
          color = 'red';
          break;
        default:
          icon = '⚠️';
      }
    } else if (errorInfo.errorName.includes('Timeout')) {
      icon = '⏰';
      color = 'yellow';
    } else if (errorInfo.errorName.includes('TypeError')) {
      icon = '🔧';
      color = 'magenta';
    } else if (errorInfo.errorName.includes('ReferenceError')) {
      icon = '📚';
      color = 'blue';
    }

    let summary = `${icon} ${this.colorize(color, errorInfo.errorName)}`;
    
    if (errorInfo.errorCode) {
      summary += ` ${this.colorize('bright', `[${errorInfo.errorCode}]`)}`;
    }
    
    if (errorInfo.errorMessage && errorInfo.errorMessage !== errorInfo.errorName) {
      summary += `: ${this.colorize('dim', this.truncateText(errorInfo.errorMessage, 50))}`;
    }

    return summary;
  }

  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format multiple errors for a test suite
   */
  formatTestSuiteErrors(testResult, options = {}) {
    if (!testResult.testResults || testResult.numFailingTests === 0) {
      return '';
    }

    const failedTests = testResult.testResults.filter(test => test.status === 'failed');
    const output = [];

    output.push(this.colorize('red', `\n💥 ${failedTests.length} test(s) failed in ${testResult.testFilePath.split('/').pop()}`));
    output.push(this.colorize('gray', '─'.repeat(60)));

    failedTests.forEach((failedTest, index) => {
      if (index > 0) output.push(''); // Add spacing between errors
      output.push(this.formatError(failedTest, options));
    });

    return output.join('\n');
  }

  /**
   * Create error summary for multiple test suites
   */
  createErrorSummary(allFailedTests) {
    if (allFailedTests.length === 0) return '';

    const errorTypes = {};
    const errorCodes = {};

    allFailedTests.forEach(test => {
      if (test.failureMessages && test.failureMessages.length > 0) {
        const errorInfo = this.parseErrorMessage(test.failureMessages[0]);
        if (errorInfo) {
          errorTypes[errorInfo.errorName] = (errorTypes[errorInfo.errorName] || 0) + 1;
          if (errorInfo.errorCode) {
            errorCodes[errorInfo.errorCode] = (errorCodes[errorInfo.errorCode] || 0) + 1;
          }
        }
      }
    });

    const output = [];
    output.push(this.colorize('red', '\n🔍 Error Summary:'));
    
    // Error types breakdown
    Object.entries(errorTypes).forEach(([type, count]) => {
      output.push(`   ${this.colorize('yellow', '•')} ${type}: ${this.colorize('bright', count)} occurrence(s)`);
    });

    // Error codes breakdown
    if (Object.keys(errorCodes).length > 0) {
      output.push(this.colorize('blue', '\n📊 HTTP Error Codes:'));
      Object.entries(errorCodes).forEach(([code, count]) => {
        output.push(`   ${this.colorize('yellow', '•')} ${code}: ${this.colorize('bright', count)} occurrence(s)`);
      });
    }

    return output.join('\n');
  }
}

module.exports = ErrorFormatter;
