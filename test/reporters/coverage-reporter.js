/**
 * Enhanced Coverage Reporter
 * Provides visual coverage information with color-coded indicators
 */

class CoverageReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    
    // ANSI color codes
    this.colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      bright: '\x1b[1m',
      bgGreen: '\x1b[42m',
      bgRed: '\x1b[41m',
      bgYellow: '\x1b[43m'
    };

    // Coverage thresholds
    this.thresholds = {
      excellent: 90,
      good: 80,
      fair: 70,
      poor: 50
    };
  }

  colorize(color, text) {
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  getCoverageColor(percentage) {
    if (percentage >= this.thresholds.excellent) return 'green';
    if (percentage >= this.thresholds.good) return 'yellow';
    if (percentage >= this.thresholds.fair) return 'blue';
    if (percentage >= this.thresholds.poor) return 'red';
    return 'red';
  }

  getCoverageIcon(percentage) {
    if (percentage >= this.thresholds.excellent) return '🟢';
    if (percentage >= this.thresholds.good) return '🟡';
    if (percentage >= this.thresholds.fair) return '🔵';
    if (percentage >= this.thresholds.poor) return '🟠';
    return '🔴';
  }

  getCoverageRating(percentage) {
    if (percentage >= this.thresholds.excellent) return 'Excellent';
    if (percentage >= this.thresholds.good) return 'Good';
    if (percentage >= this.thresholds.fair) return 'Fair';
    if (percentage >= this.thresholds.poor) return 'Poor';
    return 'Critical';
  }

  createCoverageBar(percentage, width = 20) {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    
    const color = this.getCoverageColor(percentage);
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    return `${this.colorize(color, bar)}`;
  }

  formatCoverageMetric(name, data) {
    if (!data) return '';
    
    const percentage = data.pct;
    const covered = data.covered;
    const total = data.total;
    const skipped = data.skipped || 0;
    
    const icon = this.getCoverageIcon(percentage);
    const bar = this.createCoverageBar(percentage);
    const color = this.getCoverageColor(percentage);
    
    return (
      `${icon} ${this.colorize('bright', name.padEnd(12))} ` +
      `${bar} ${this.colorize(color, percentage.toFixed(1).padStart(5))}% ` +
      `${this.colorize('gray', `(${covered}/${total})`)}` +
      (skipped > 0 ? ` ${this.colorize('yellow', `${skipped} skipped`)}` : '')
    );
  }

  onRunComplete(contexts, results) {
    if (!results.coverageMap) {
      return; // No coverage data available
    }

    const coverageSummary = results.coverageMap.getCoverageSummary();
    
    console.log('\n' + this.colorize('cyan', '📊 Code Coverage Report'));
    console.log(this.colorize('gray', '━'.repeat(70)));

    // Overall coverage metrics
    const metrics = ['statements', 'branches', 'functions', 'lines'];
    
    metrics.forEach(metric => {
      const data = coverageSummary[metric];
      if (data) {
        console.log(`  ${this.formatCoverageMetric(metric, data)}`);
      }
    });

    // Overall coverage score (average of all metrics)
    const overallScore = metrics.reduce((sum, metric) => {
      return sum + (coverageSummary[metric]?.pct || 0);
    }, 0) / metrics.length;

    const overallRating = this.getCoverageRating(overallScore);
    const overallColor = this.getCoverageColor(overallScore);
    const overallIcon = this.getCoverageIcon(overallScore);

    console.log('\n' + this.colorize('bright', '🎯 Overall Coverage:'));
    console.log(
      `  ${overallIcon} ${this.colorize(overallColor, overallScore.toFixed(1))}% ` +
      `${this.colorize(overallColor, `(${overallRating})`)} ` +
      `${this.createCoverageBar(overallScore, 30)}`
    );

    // Coverage recommendations
    console.log('\n' + this.colorize('bright', '💡 Recommendations:'));
    
    if (overallScore >= this.thresholds.excellent) {
      console.log(`  ${this.colorize('green', '✨ Excellent coverage! Keep up the great work!')}`);
    } else if (overallScore >= this.thresholds.good) {
      console.log(`  ${this.colorize('yellow', '👍 Good coverage. Consider improving to 90%+ for excellence.')}`);
    } else if (overallScore >= this.thresholds.fair) {
      console.log(`  ${this.colorize('blue', '📈 Fair coverage. Focus on increasing test coverage.')}`);
    } else {
      console.log(`  ${this.colorize('red', '⚠️  Low coverage detected. Prioritize writing more tests.')}`);
    }

    // Specific recommendations based on metrics
    metrics.forEach(metric => {
      const data = coverageSummary[metric];
      if (data && data.pct < this.thresholds.good) {
        console.log(
          `  ${this.colorize('yellow', '→')} Improve ${metric} coverage ` +
          `${this.colorize('gray', `(currently ${data.pct.toFixed(1)}%)`)}`
        );
      }
    });

    // Coverage thresholds reference
    console.log('\n' + this.colorize('gray', '📋 Coverage Thresholds:'));
    console.log(`  ${this.colorize('green', '🟢 Excellent')}: ≥90% | ${this.colorize('yellow', '🟡 Good')}: ≥80% | ${this.colorize('blue', '🔵 Fair')}: ≥70% | ${this.colorize('red', '🔴 Poor')}: <70%`);
    
    console.log(this.colorize('gray', '━'.repeat(70)) + '\n');
  }
}

module.exports = CoverageReporter;
