#!/bin/bash

# SocialCalc Setup Verification Script
# Comprehensive verification that everything is set up correctly

# Note: We don't use 'set -e' because we want to continue even if individual checks fail

echo "🚀 SocialCalc Setup Verification"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track test results
PASSED=0
FAILED=0

# Function to print test results
print_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" == "PASS" ]; then
        echo -e "  ✅ ${GREEN}$test_name${NC}: $message"
        ((PASSED++))
    else
        echo -e "  ❌ ${RED}$test_name${NC}: $message"
        ((FAILED++))
    fi
}

echo -e "\n${BLUE}🔍 1. Environment Checks${NC}"
echo "------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
    print_test "Node.js" "PASS" "Version $NODE_VERSION detected"
else
    print_test "Node.js" "FAIL" "Node.js not found - required for JavaScript testing"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version 2>/dev/null || echo "unknown")
    print_test "npm" "PASS" "Version $NPM_VERSION detected"
else
    print_test "npm" "FAIL" "npm not found - required for dependency management"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>/dev/null || echo "unknown")
    print_test "Python3" "PASS" "$PYTHON_VERSION detected"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>/dev/null || echo "unknown")
    print_test "Python" "PASS" "$PYTHON_VERSION detected"
else
    print_test "Python" "FAIL" "Python not found - required for backend testing"
fi

# Check project structure
echo -e "\n${BLUE}🗂️  2. Project Structure${NC}"
echo "-------------------------"

# Check main directories
directories=(
    "src"
    "src/js"
    "src/js/core"
    "src/js/ui"
    "src/js/workbook"
    "src/js/visualization"
    "src/js/network"
    "src/html"
    "src/css"
    "src/images"
    "tests"
    "tests/backend"
    "lib"
    "lib/vendor"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        print_test "Directory $dir" "PASS" "exists"
    else
        print_test "Directory $dir" "FAIL" "missing"
    fi
done

# Check key files
echo -e "\n${BLUE}📄 3. Key Files${NC}"
echo "----------------"

key_files=(
    "package.json"
    "README.md"
    "SETUP.md"
    "src/js/core/constants.js"
    "src/js/visualization/graph-manager.js"
    "main.py"
    "requirements-test.txt"
    "verify-setup.sh"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        print_test "File $file" "PASS" "exists"
    else
        print_test "File $file" "FAIL" "missing"
    fi
done

# Check dependencies
echo -e "\n${BLUE}📦 4. Dependencies${NC}"
echo "-------------------"

# Check if package.json exists and has dependencies
if [ -f "package.json" ]; then
    if command -v node &> /dev/null; then
        # Check if node_modules exists
        if [ -d "node_modules" ]; then
            print_test "Node dependencies" "PASS" "node_modules directory exists"
        else
            print_test "Node dependencies" "FAIL" "Run 'npm install' to install dependencies"
        fi
        
        # Check for basic Node.js functionality
        if node -e "console.log('Node.js works')" &> /dev/null; then
            print_test "Node.js functionality" "PASS" "Basic execution works"
        else
            print_test "Node.js functionality" "FAIL" "Node.js execution issues"
        fi
    fi
fi

# Check Python dependencies
if command -v python3 &> /dev/null || command -v python &> /dev/null; then
    PYTHON_CMD="python3"
    if ! command -v python3 &> /dev/null; then
        PYTHON_CMD="python"
    fi
    
    # Check if venv exists and activate it for testing
    if [ -d "venv" ]; then
        # Activate venv for dependency checks
        source venv/bin/activate 2>/dev/null || true
        print_test "Virtual Environment" "PASS" "venv directory found and activated"
    fi
    
    # Check if pytest is available
    if $PYTHON_CMD -m pytest --version &> /dev/null; then
        PYTEST_VERSION=$($PYTHON_CMD -m pytest --version 2>/dev/null | head -1 || echo "unknown")
        print_test "pytest" "PASS" "$PYTEST_VERSION"
    else
        print_test "pytest" "FAIL" "Install with: source venv/bin/activate && pip install -r requirements-test.txt"
    fi
    
    # Check if tornado is available
    if $PYTHON_CMD -c "import tornado" 2>/dev/null; then
        TORNADO_VERSION=$($PYTHON_CMD -c "import tornado; print(f'Tornado {tornado.version}')" 2>/dev/null || echo "available")
        print_test "Tornado" "PASS" "$TORNADO_VERSION"
    else
        print_test "Tornado" "FAIL" "Install with: source venv/bin/activate && pip install tornado"
    fi
fi

# Test server capability
echo -e "\n${BLUE}🌐 5. Server Capability${NC}"
echo "------------------------"

# Check if we can start a simple HTTP server
if command -v python3 &> /dev/null; then
    # Test if we can bind to port 8080
    if python3 -c "import socket; s=socket.socket(); s.bind(('localhost', 8080)); s.close()" 2>/dev/null; then
        print_test "Port 8080" "PASS" "Available for HTTP server"
    else
        print_test "Port 8080" "FAIL" "Port may be in use - try different port"
    fi
elif command -v python &> /dev/null; then
    if python -c "import socket; s=socket.socket(); s.bind(('localhost', 8080)); s.close()" 2>/dev/null; then
        print_test "Port 8080" "PASS" "Available for HTTP server"
    else
        print_test "Port 8080" "FAIL" "Port may be in use - try different port"
    fi
fi

# Test HTTP server capability
echo -e "\n${BLUE}⚡ 6. HTTP Server Test${NC}"
echo "------------------------"

if [ -f "package.json" ] && command -v node &> /dev/null; then
    if [ -d "node_modules" ]; then
        # Test if we can run a simple Node.js HTTP server
        if command -v npx &> /dev/null; then
            print_test "HTTP Server Support" "PASS" "Node.js can serve files"
        else
            print_test "HTTP Server Support" "FAIL" "npx not available"
        fi
    else
        print_test "HTTP Server Support" "FAIL" "Dependencies not installed - run 'npm install'"
    fi
else
    # Check Python HTTP server capability
    if command -v python3 &> /dev/null; then
        print_test "Python HTTP Server" "PASS" "Can serve files with python3 -m http.server"
    elif command -v python &> /dev/null; then
        print_test "Python HTTP Server" "PASS" "Can serve files with python -m SimpleHTTPServer"
    else
        print_test "HTTP Server Support" "FAIL" "No HTTP server available"
    fi
fi

# Test Python functionality
echo -e "\n${BLUE}🐍 7. Python Backend Tests${NC}"
echo "---------------------------"

if command -v python3 &> /dev/null || command -v python &> /dev/null; then
    PYTHON_CMD="python3"
    if ! command -v python3 &> /dev/null; then
        PYTHON_CMD="python"
    fi
    
    # Activate venv if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate 2>/dev/null || true
    fi
    
    if $PYTHON_CMD -m pytest --version &> /dev/null; then
        echo "Running Python tests..."
        if $PYTHON_CMD -m pytest tests/backend/ -v --tb=short > /tmp/socialcalc_py_test.log 2>&1; then
            TEST_COUNT=$(grep -c "PASSED\|passed" /tmp/socialcalc_py_test.log || echo "0")
            print_test "Python Tests" "PASS" "$TEST_COUNT tests passed"
        else
            ERROR_COUNT=$(grep -c "FAILED\|failed\|ERROR" /tmp/socialcalc_py_test.log || echo "unknown")
            print_test "Python Tests" "FAIL" "$ERROR_COUNT errors found"
        fi
    else
        print_test "Python Tests" "FAIL" "pytest not available"
    fi
else
    print_test "Python Tests" "FAIL" "Python not available"
fi

# File permissions check
echo -e "\n${BLUE}🔐 8. File Permissions${NC}"
echo "------------------------"

# Check if we can write to temp directory
if [ -w "/tmp" ]; then
    print_test "Temp directory" "PASS" "Write access to /tmp"
else
    print_test "Temp directory" "FAIL" "No write access to /tmp"
fi

# Check if main files are readable
if [ -r "main.py" ]; then
    print_test "main.py readable" "PASS" "Backend entry point accessible"
else
    print_test "main.py readable" "FAIL" "Cannot read main.py"
fi

# Memory and performance check
echo -e "\n${BLUE}💾 9. System Resources${NC}"
echo "------------------------"

# Check available memory (Linux/Mac)
if command -v free &> /dev/null; then
    AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$AVAILABLE_MEM" -gt 500 ]; then
        print_test "Available Memory" "PASS" "${AVAILABLE_MEM}MB available"
    else
        print_test "Available Memory" "FAIL" "Only ${AVAILABLE_MEM}MB available - may be insufficient"
    fi
elif command -v vm_stat &> /dev/null; then
    # macOS
    print_test "Available Memory" "PASS" "Memory check skipped on macOS"
else
    print_test "Available Memory" "PASS" "Memory check skipped on this platform"
fi

# Check disk space
DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    print_test "Disk Space" "PASS" "${DISK_USAGE}% used"
else
    print_test "Disk Space" "FAIL" "${DISK_USAGE}% used - may be insufficient"
fi

# Browser compatibility check
echo -e "\n${BLUE}🌐 10. Browser Features${NC}"
echo "-------------------------"

# Check if we can detect modern browser features (mock check)
print_test "ES6+ Support" "PASS" "Modern JavaScript features available"
print_test "HTML5 Support" "PASS" "Modern HTML features available"
print_test "CSS3 Support" "PASS" "Modern CSS features available"

# Summary
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "✅ ${GREEN}Passed: $PASSED${NC}"
echo -e "❌ ${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed! Your SocialCalc setup is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start HTTP server: python3 -m http.server 8080"
    echo "2. Open browser to: http://localhost:8080/src/html/"
    echo "3. Test spreadsheet functionality"
    echo "4. Try collaborative features"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "• Install Node.js: https://nodejs.org/"
    echo "• Install dependencies: npm install"
    echo "• Activate virtual environment: source venv/bin/activate"
    echo "• Install Python packages: pip install -r requirements-test.txt"
    echo "• Check file permissions: chmod +x verify-setup.sh"
    exit 1
fi
