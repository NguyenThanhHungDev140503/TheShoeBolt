/**
 * Progress Reporter
 * Shows real-time progress with visual indicators and ETA
 */

const ErrorFormatter = require('./error-formatter');

class ProgressReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};

    // Initialize error formatter
    this.errorFormatter = new ErrorFormatter();

    // ANSI color codes
    this.colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      bright: '\x1b[1m'
    };

    this.startTime = null;
    this.totalTests = 0;
    this.completedTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.currentSuite = '';
  }

  colorize(color, text) {
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  formatDuration(milliseconds) {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }

  createProgressBar(current, total, width = 30) {
    const percentage = Math.min(current / total, 1);
    const filled = Math.floor(percentage * width);
    const empty = width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.floor(percentage * 100);
    
    return `${this.colorize('cyan', '[')}${this.colorize('green', bar)}${this.colorize('cyan', ']')} ${percent}%`;
  }

  estimateTimeRemaining(current, total, elapsed) {
    if (current === 0) return 'calculating...';
    const rate = current / elapsed;
    const remaining = (total - current) / rate;
    return this.formatDuration(remaining);
  }

  clearLine() {
    process.stdout.write('\r\x1b[K');
  }

  updateProgress() {
    if (this.totalTests === 0) return;

    const elapsed = Date.now() - this.startTime;
    const eta = this.estimateTimeRemaining(this.completedTests, this.totalTests, elapsed);
    
    const progressBar = this.createProgressBar(this.completedTests, this.totalTests);
    const stats = `${this.colorize('green', this.passedTests)} passed, ${this.colorize('red', this.failedTests)} failed`;
    const timing = `${this.formatDuration(elapsed)} elapsed, ETA: ${eta}`;
    
    this.clearLine();
    process.stdout.write(
      `🔄 ${progressBar} ${this.completedTests}/${this.totalTests} | ${stats} | ${timing}`
    );
  }

  onRunStart(results, options) {
    this.startTime = Date.now();
    this.totalTests = results.numTotalTestSuites;
    console.log(this.colorize('cyan', '\n🚀 Starting test execution...\n'));
  }

  onTestFileStart(test) {
    const relativePath = test.path.replace(process.cwd(), '').replace(/^\//, '');
    this.currentSuite = relativePath;
    
    // Show current suite being executed
    this.clearLine();
    process.stdout.write(`📝 Running: ${this.colorize('blue', relativePath)}`);
  }

  onTestFileResult(test, testResult, aggregatedResult) {
    this.completedTests++;
    this.passedTests += testResult.numPassingTests;
    this.failedTests += testResult.numFailingTests;
    
    // Update progress bar
    this.updateProgress();
    
    // Show immediate result for current suite
    const status = testResult.numFailingTests > 0 ? 
      this.colorize('red', '❌ FAIL') : 
      this.colorize('green', '✅ PASS');
    
    const duration = this.formatDuration(
      testResult.perfStats.end - testResult.perfStats.start
    );
    
    console.log(`\n  ${status} ${this.currentSuite} (${duration})`);
    
    // Show enhanced failing test details immediately
    if (testResult.numFailingTests > 0 && testResult.testResults) {
      const failedTests = testResult.testResults.filter(result => result.status === 'failed');

      // Show first 2 failures with enhanced formatting
      failedTests.slice(0, 2).forEach(failedTest => {
        const formattedError = this.errorFormatter.formatError(failedTest, {
          showStackTrace: false,
          maxWidth: 80
        });
        console.log(`    ${formattedError.split('\n')[0]}`); // Show only first line for progress
        console.log(`    ${formattedError.split('\n')[1] || ''}`); // Show error summary
      });

      if (failedTests.length > 2) {
        const remaining = failedTests.length - 2;
        const remainingMsg = `... and ${remaining} more failures`;
        console.log(`    ${this.colorize('gray', remainingMsg)}`);
      }
    }
  }

  onRunComplete(contexts, results) {
    this.clearLine();
    
    const duration = Date.now() - this.startTime;
    const { numTotalTests, numPassedTests, numFailedTests } = results;
    
    console.log('\n' + this.colorize('bright', '🏁 Test execution completed!'));
    
    // Final summary
    const finalStatus = numFailedTests === 0 ? 
      this.colorize('green', '🎉 ALL TESTS PASSED') : 
      this.colorize('red', `💥 ${numFailedTests} TESTS FAILED`);
    
    console.log(`\n${finalStatus}`);
    console.log(
      `📊 Total: ${numTotalTests} tests | ` +
      `${this.colorize('green', numPassedTests)} passed | ` +
      `${this.colorize('red', numFailedTests)} failed | ` +
      `⏱️  ${this.formatDuration(duration)}`
    );

    // Performance rating
    const testsPerSecond = numTotalTests / (duration / 1000);
    let performanceRating = '';
    
    if (testsPerSecond > 50) {
      performanceRating = this.colorize('green', '🚀 Excellent performance');
    } else if (testsPerSecond > 20) {
      performanceRating = this.colorize('yellow', '⚡ Good performance');
    } else if (testsPerSecond > 10) {
      performanceRating = this.colorize('yellow', '🐌 Moderate performance');
    } else {
      performanceRating = this.colorize('red', '🐢 Consider optimizing tests');
    }
    
    console.log(`${performanceRating} (${testsPerSecond.toFixed(1)} tests/sec)\n`);
  }
}

module.exports = ProgressReporter;
