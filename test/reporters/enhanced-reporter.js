/**
 * Enhanced Jest Reporter
 * Provides improved formatting, grouping, and visual indicators for test results
 */

const ErrorFormatter = require('./error-formatter');

class EnhancedReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};

    // Initialize error formatter
    this.errorFormatter = new ErrorFormatter();

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
      white: '\x1b[37m',
      gray: '\x1b[90m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m'
    };

    // Test type icons and colors
    this.testTypes = {
      unit: { icon: '🔬', color: 'blue', name: 'Unit Tests' },
      component: { icon: '🧩', color: 'green', name: 'Component Tests' },
      e2e: { icon: '🚀', color: 'magenta', name: 'E2E Tests' }
    };

    this.startTime = null;
    this.testResults = [];
    this.allFailedTests = [];
  }

  colorize(color, text) {
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  getTestType(testPath) {
    if (testPath.includes('/unit/')) return 'unit';
    if (testPath.includes('/component/')) return 'component';
    if (testPath.includes('/e2e/')) return 'e2e';
    return 'unit'; // default
  }

  formatDuration(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }

  onRunStart(results, options) {
    this.startTime = Date.now();
    console.log('\n' + this.colorize('cyan', '🧪 Starting Test Suite Execution'));
    console.log(this.colorize('gray', '━'.repeat(60)));
  }

  onTestFileStart(test) {
    const testType = this.getTestType(test.path);
    const typeInfo = this.testTypes[testType];
    
    const relativePath = test.path.replace(process.cwd(), '').replace(/^\//, '');
    console.log(
      `\n${typeInfo.icon} ${this.colorize(typeInfo.color, typeInfo.name)} ` +
      `${this.colorize('dim', relativePath)}`
    );
  }

  onTestFileResult(test, testResult, aggregatedResult) {
    const testType = this.getTestType(test.path);
    const typeInfo = this.testTypes[testType];
    
    // Store result for summary
    this.testResults.push({
      ...testResult,
      testType,
      typeInfo
    });

    const { numFailingTests, numPassingTests, numTodoTests, numPendingTests } = testResult;
    const duration = this.formatDuration(testResult.perfStats.end - testResult.perfStats.start);
    
    // Status indicator
    let statusIcon, statusColor;
    if (numFailingTests > 0) {
      statusIcon = '❌';
      statusColor = 'red';
    } else if (numTodoTests > 0 || numPendingTests > 0) {
      statusIcon = '⚠️';
      statusColor = 'yellow';
    } else {
      statusIcon = '✅';
      statusColor = 'green';
    }

    // Test counts summary
    const counts = [];
    if (numPassingTests > 0) counts.push(this.colorize('green', `${numPassingTests} passed`));
    if (numFailingTests > 0) counts.push(this.colorize('red', `${numFailingTests} failed`));
    if (numTodoTests > 0) counts.push(this.colorize('yellow', `${numTodoTests} todo`));
    if (numPendingTests > 0) counts.push(this.colorize('yellow', `${numPendingTests} skipped`));

    console.log(
      `  ${statusIcon} ${this.colorize(statusColor, 'RESULT')} ` +
      `${counts.join(', ')} ${this.colorize('dim', `(${duration})`)}`
    );

    // Show failing tests details with enhanced error formatting
    if (numFailingTests > 0 && testResult.testResults) {
      const failedTests = testResult.testResults.filter(result => result.status === 'failed');

      // Store failed tests for summary
      this.allFailedTests.push(...failedTests);

      // Show enhanced error details
      console.log(this.errorFormatter.formatTestSuiteErrors(testResult, {
        showStackTrace: false,
        maxWidth: 100
      }));
    }
  }

  onRunComplete(contexts, results) {
    const duration = Date.now() - this.startTime;
    const { numPassedTests, numFailedTests, numTodoTests, numPendingTests } = results;

    console.log('\n' + this.colorize('cyan', '📊 Test Suite Summary'));
    console.log(this.colorize('gray', '━'.repeat(60)));

    // Group results by test type
    const resultsByType = this.testResults.reduce((acc, result) => {
      const type = result.testType;
      if (!acc[type]) {
        acc[type] = {
          typeInfo: result.typeInfo,
          passed: 0,
          failed: 0,
          todo: 0,
          pending: 0,
          suites: 0,
          duration: 0
        };
      }
      acc[type].passed += result.numPassingTests;
      acc[type].failed += result.numFailingTests;
      acc[type].todo += result.numTodoTests;
      acc[type].pending += result.numPendingTests;
      acc[type].suites += 1;
      acc[type].duration += (result.perfStats.end - result.perfStats.start);
      return acc;
    }, {});

    // Display results by type
    Object.entries(resultsByType).forEach(([type, stats]) => {
      const { typeInfo } = stats;
      const suitesInfo = `(${stats.suites} suites, ${this.formatDuration(stats.duration)})`;

      console.log(
        `\n${typeInfo.icon} ${this.colorize(typeInfo.color, typeInfo.name)}: ` +
        `${this.colorize('green', stats.passed)} passed, ` +
        `${this.colorize('red', stats.failed)} failed ` +
        `${this.colorize('dim', suitesInfo)}`
      );
    });

    // Overall summary
    console.log('\n' + this.colorize('bright', '🎯 Overall Results:'));

    const overallStatus = numFailedTests === 0 ? 'PASSED' : 'FAILED';
    const overallColor = numFailedTests === 0 ? 'green' : 'red';
    const overallIcon = numFailedTests === 0 ? '🎉' : '💥';
    const durationInfo = `(${this.formatDuration(duration)})`;

    console.log(
      `${overallIcon} ${this.colorize(overallColor, overallStatus)} ` +
      `${this.colorize('green', numPassedTests)} passed, ` +
      `${this.colorize('red', numFailedTests)} failed, ` +
      `${this.colorize('yellow', numTodoTests + numPendingTests)} skipped ` +
      `${this.colorize('dim', durationInfo)}`
    );

    // Show enhanced error summary if there are failures
    if (numFailedTests > 0 && this.allFailedTests.length > 0) {
      console.log(this.errorFormatter.createErrorSummary(this.allFailedTests));
    }

    // Performance insights
    if (duration > 10000) { // > 10 seconds
      console.log(`\n${this.colorize('yellow', '⚡ Performance Note:')} Test suite took ${this.formatDuration(duration)}`);
    }

    console.log(this.colorize('gray', '━'.repeat(60)) + '\n');
  }
}

module.exports = EnhancedReporter;
