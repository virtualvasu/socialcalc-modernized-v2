# SocialCalc/EtherCalc Test Suite

A comprehensive test suite for the modernized SocialCalc/EtherCalc spreadsheet application, providing unit tests, integration tests, and smoke tests for all major functionality.

## 🎯 Test Coverage

### JavaScript Frontend Tests (Jest)

#### Unit Tests (`/tests/unit/`)
- **`constants.test.js`** - Tests SocialCalc constants, localization, and configuration
- **`number-formatter.test.js`** - Tests number formatting functionality and edge cases
- **`formula-parser.test.js`** - Tests formula parsing, calculation engine, and built-in functions

#### Smoke Tests (`/tests/smoke/`)
- **`spreadsheet-operations.test.js`** - Tests major features: loading sheets, editing cells, saving data

#### Integration Tests (`/tests/integration/`)
- **`collaboration.test.js`** - Tests real-time collaboration, message broadcasting, and multi-user editing

### Python Backend Tests (pytest)

#### API Tests (`/tests/backend/`)
- **`test_api_endpoints.py`** - Tests Tornado web handlers, database operations, and API endpoints

### Test Fixtures (`/tests/fixtures/`)
- **`sample-spreadsheet.js`** - Mock data, spreadsheet samples, and collaboration messages

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js dependencies
npm install

# Install Python testing dependencies
pip install -r requirements-test.txt
```

### Running Tests

#### JavaScript Tests (Jest)
```bash
# Run all JavaScript tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test suites
npm run test:unit      # Unit tests only
npm run test:smoke     # Smoke tests only
npm run test:integration # Integration tests only
```

#### Python Tests (pytest)
```bash
# Run all Python tests
pytest tests/backend/

# Run with coverage
pytest --cov=main tests/backend/

# Run specific test file
pytest tests/backend/test_api_endpoints.py

# Run with verbose output
pytest -v tests/backend/
```

## 📋 Test Structure

### Frontend Test Architecture

```
tests/
├── setup.js                    # Global test setup and mocks
├── fixtures/
│   └── sample-spreadsheet.js   # Test data and mock objects
├── unit/
│   ├── constants.test.js        # Constants and configuration tests
│   ├── number-formatter.test.js # Number formatting tests
│   └── formula-parser.test.js   # Formula parsing and calculation tests
├── smoke/
│   └── spreadsheet-operations.test.js # Major feature tests
└── integration/
    └── collaboration.test.js    # Real-time collaboration tests
```

### Backend Test Architecture

```
tests/backend/
└── test_api_endpoints.py       # API endpoint and database tests
```

## 🧪 Test Categories

### 1. **Unit Tests** - Individual Function Testing
- Test isolated functions and methods
- Mock external dependencies
- Focus on specific behaviors and edge cases
- **Coverage**: Core engine functions, formatters, parsers

### 2. **Smoke Tests** - Major Feature Validation
- Test critical user journeys
- Verify core functionality works end-to-end
- **Coverage**: Loading sheets, editing cells, saving data

### 3. **Integration Tests** - Component Interaction Testing
- Test interaction between multiple components
- Verify data flow and communication
- **Coverage**: Real-time collaboration, message broadcasting

### 4. **API Tests** - Backend Endpoint Testing
- Test HTTP endpoints and database operations
- Verify request/response handling
- **Coverage**: Stock data, file operations, user sessions

## 📊 Test Coverage Goals

| Component | Target Coverage | Current Status |
|-----------|----------------|----------------|
| Core Engine | 80% | ✅ Implemented |
| Formula Parser | 85% | ✅ Implemented |
| Number Formatter | 90% | ✅ Implemented |
| Collaboration | 75% | ✅ Implemented |
| API Endpoints | 70% | ✅ Implemented |

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom (browser simulation)
- **Coverage**: 70% threshold for all metrics
- **Setup**: Global mocks and DOM structure
- **Exclusions**: Vendor libraries, minified files

### Test Environment Setup (`tests/setup.js`)
- Mock browser APIs (localStorage, sessionStorage)
- Mock jQuery and external libraries
- Create basic DOM structure for tests
- Initialize SocialCalc namespace

## 🏗️ Test Data and Fixtures

### Sample Spreadsheet Data
```javascript
// Basic spreadsheet with simple data
basic: {
  cells: {
    'A1': { value: 'Name', datatype: 't' },
    'B1': { value: 'Age', datatype: 't' },
    'A2': { value: 'John', datatype: 't' },
    'B2': { value: '30', datatype: 'n' }
  }
}

// Financial data with formulas
financial: {
  cells: {
    'A1': { value: 'AAPL', datatype: 't' },
    'B1': { value: '150.50', datatype: 'n' },
    'C1': { value: '100', datatype: 'n' },
    'D1': { value: '=B1*C1', datatype: 'f', formula: 'B1*C1' }
  }
}
```

### Collaboration Test Data
```javascript
collaborationMessages: [
  {
    id: 'msg1',
    type: 'cell-edit',
    data: { cell: 'A1', value: 'Updated Value' },
    from: 'user1',
    timestamp: Date.now()
  }
]
```

## ⚡ Performance Testing

### Load Testing Scenarios
- **High Message Volume**: 150+ messages per session
- **Multiple Sessions**: 10+ concurrent collaboration sessions
- **Large Spreadsheets**: 1000+ cells with formulas
- **Memory Management**: Cache size limits and cleanup

### Error Handling Tests
- Invalid cell references
- Circular formula dependencies
- Network connection failures
- Corrupted save data
- Database connection errors

## 🐛 Debugging Tests

### Common Issues and Solutions

#### Jest Tests Not Running
```bash
# Check Node.js version (requires 14+)
node --version

# Clear Jest cache
npx jest --clearCache

# Run with debug info
npm test -- --verbose
```

#### Python Tests Failing
```bash
# Check Python dependencies
pip list | grep pytest

# Run with debug output
pytest -s tests/backend/

# Check for import errors
python -c "import main"
```

#### Mock Issues
```javascript
// Clear mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// Reset DOM
beforeEach(() => {
  document.body.innerHTML = '';
});
```

## 📈 Continuous Integration

### GitHub Actions Integration
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run JavaScript tests
        run: npm test
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install Python dependencies
        run: pip install -r requirements-test.txt
      - name: Run Python tests
        run: pytest
```

## 🔍 Test Quality Metrics

### Maintained Standards
- **Code Coverage**: Minimum 70% for all components
- **Test Isolation**: No dependencies between tests
- **Mock Usage**: External dependencies properly mocked
- **Error Scenarios**: Edge cases and error conditions tested
- **Documentation**: All test files have clear descriptions

### Review Checklist
- [ ] Tests cover happy path and edge cases
- [ ] Mocks are properly configured and cleaned up
- [ ] Test names clearly describe what is being tested
- [ ] Assertions are specific and meaningful
- [ ] Setup and teardown properly handle test state

## 🎨 Best Practices

1. **Test Names**: Use descriptive names that explain the expected behavior
2. **AAA Pattern**: Arrange, Act, Assert structure
3. **One Assertion**: Focus each test on a single behavior
4. **Mock External**: Mock all external dependencies
5. **Clean State**: Ensure tests don't affect each other

## 📚 References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [pytest Documentation](https://docs.pytest.org/)
- [Testing Best Practices](https://testingjavascript.com/)
- [SocialCalc Documentation](http://socialcalc.org/)

---

**Generated with:** Claude Code Assistant  
**Last Updated:** $(date)  
**Test Suite Version:** 1.0.0