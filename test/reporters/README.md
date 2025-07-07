# Custom Jest Reporters

Bộ custom reporters được thiết kế để cải thiện trải nghiệm hiển thị kết quả test với visual indicators, progress tracking, và coverage insights.

## Reporters Available

### 1. Enhanced Reporter (`enhanced-reporter.js`)
**Mục đích**: Cải thiện format hiển thị kết quả test với grouping và visual indicators

**Tính năng**:
- 🔬 Unit Tests (màu xanh dương)
- 🧩 Component Tests (màu xanh lá)  
- 🚀 E2E Tests (màu tím)
- Hiển thị status với emoji (✅ ❌ ⚠️)
- Group kết quả theo test type
- Summary với performance insights

**Output mẫu**:
```
🧪 Starting Test Suite Execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔬 Unit Tests test/unit/modules/auth/decorators/roles.decorator.spec.ts
  ✅ RESULT 16 passed (3.8s)

📊 Test Suite Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔬 Unit Tests: 16 passed, 0 failed (1 suites, 3.81s)

🎯 Overall Results:
🎉 PASSED 16 passed, 0 failed, 0 skipped (4.06s)
```

### 2. Progress Reporter (`progress-reporter.js`)
**Mục đích**: Hiển thị real-time progress với visual progress bar và ETA

**Tính năng**:
- Progress bar với percentage
- ETA (Estimated Time of Arrival)
- Real-time test counts
- Performance rating (tests/second)
- Immediate failure feedback

**Output mẫu**:
```
🚀 Starting test execution...

📝 Running: test/unit/modules/auth/decorators/roles.decorator.spec.ts
🔄 [██████████████████████████████] 100% 1/1 | 16 passed, 0 failed | 4.1s elapsed, ETA: 0ms

🏁 Test execution completed!
🎉 ALL TESTS PASSED
📊 Total: 16 tests | 16 passed | 0 failed | ⏱️  4.1s
🐢 Consider optimizing tests (3.9 tests/sec)
```

### 3. Coverage Reporter (`coverage-reporter.js`)
**Mục đích**: Enhanced coverage visualization với color-coded indicators

**Tính năng**:
- Visual coverage bars
- Color-coded thresholds (🟢🟡🔵🔴)
- Coverage rating (Excellent/Good/Fair/Poor)
- Specific recommendations
- Threshold reference guide

**Output mẫu**:
```
📊 Code Coverage Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Statements   ████████████████████  95.2% (152/160)
🟡 Branches     ████████████░░░░░░░░  82.4% (89/108)
🟢 Functions    ████████████████████  91.7% (44/48)
🟢 Lines        ████████████████████  94.8% (146/154)

🎯 Overall Coverage:
🟢 91.0% (Excellent) ██████████████████████████████

💡 Recommendations:
✨ Excellent coverage! Keep up the great work!

📋 Coverage Thresholds:
🟢 Excellent: ≥90% | 🟡 Good: ≥80% | 🔵 Fair: ≥70% | 🔴 Poor: <70%
```

## Configuration

### Jest Configuration Files

**jest-unit.json**:
```json
{
  "reporters": [
    "<rootDir>/test/reporters/enhanced-reporter.js",
    "<rootDir>/test/reporters/progress-reporter.js",
    "<rootDir>/test/reporters/coverage-reporter.js",
    ["jest-junit", {
      "outputDirectory": "./coverage",
      "outputName": "unit-test-results.xml",
      "suiteName": "Unit Tests"
    }]
  ]
}
```

**jest-component.json**:
```json
{
  "reporters": [
    "<rootDir>/test/reporters/enhanced-reporter.js",
    "<rootDir>/test/reporters/progress-reporter.js"
  ]
}
```

**jest-e2e.json**:
```json
{
  "reporters": [
    "<rootDir>/test/reporters/enhanced-reporter.js",
    "<rootDir>/test/reporters/progress-reporter.js"
  ]
}
```

## Usage

### Running Tests with Custom Reporters

```bash
# Unit tests với full reporters
npm run test:unit

# Component tests
npm run test:component  

# E2E tests
npm run test:e2e

# Specific test pattern
npm run test:unit -- --testPathPattern=roles.decorator
```

### Environment Variables

```bash
# Enable verbose mode for detailed logging
JEST_VERBOSE=true npm run test:unit

# Enable debug mode for full error details
NODE_ENV=test-debug npm run test:unit
```

## Customization

### Thresholds

Có thể điều chỉnh coverage thresholds trong `coverage-reporter.js`:

```javascript
this.thresholds = {
  excellent: 90,  // ≥90% = 🟢 Excellent
  good: 80,       // ≥80% = 🟡 Good  
  fair: 70,       // ≥70% = 🔵 Fair
  poor: 50        // ≥50% = 🟠 Poor, <50% = 🔴 Critical
};
```

### Colors và Icons

Có thể tùy chỉnh màu sắc và icons trong từng reporter:

```javascript
this.testTypes = {
  unit: { icon: '🔬', color: 'blue', name: 'Unit Tests' },
  component: { icon: '🧩', color: 'green', name: 'Component Tests' },
  e2e: { icon: '🚀', color: 'magenta', name: 'E2E Tests' }
};
```

## Benefits

1. **Visual Clarity**: Emoji và màu sắc giúp phân biệt nhanh các loại test
2. **Progress Tracking**: Real-time progress với ETA giúp estimate thời gian
3. **Performance Insights**: Đánh giá performance và đưa ra recommendations
4. **Coverage Visualization**: Visual coverage bars với thresholds rõ ràng
5. **Immediate Feedback**: Hiển thị failures ngay lập tức để debug nhanh
6. **Structured Output**: Organized output giúp dễ đọc và theo dõi

## Troubleshooting

### Reporter không hoạt động
- Kiểm tra đường dẫn trong Jest config
- Đảm bảo file reporters tồn tại
- Kiểm tra syntax errors trong reporter files

### Output bị duplicate
- Đảm bảo không có "default" reporter khi sử dụng custom reporters
- Kiểm tra multiple reporters không conflict

### Performance issues
- Giảm số lượng reporters nếu cần
- Sử dụng conditional logging based on environment
