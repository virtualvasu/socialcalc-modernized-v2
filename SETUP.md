# SocialCalc Installation & Setup Guide

## 📋 Installation Prerequisites

### System Requirements
- **Operating System:** Linux, macOS, or Windows
- **Node.js:** Version 16+ (recommended: 18+)
- **Python:** Version 3.8+ (recommended: 3.10+)
- **Memory:** Minimum 4GB RAM (recommended: 8GB+)
- **Storage:** At least 1GB free space

## 🚀 Quick Installation

```bash
# 1. Install dependencies
npm install
pip install -r requirements-test.txt

# 2. Verify everything works
./verify-setup.sh

# 3. Start testing
python3 -m http.server 8080
```

## 🔧 Detailed Setup Steps

### 1. Node.js and npm Setup
```bash
# Check current versions
node --version    # Should be 16+
npm --version     # Should be 8+

# Install/update if needed
# Visit: https://nodejs.org/

# Install project dependencies
npm install
```

### 2. Python Environment Setup
```bash
# Check Python version
python3 --version    # Should be 3.8+

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements-test.txt
```

### 3. Project Verification
```bash
# Run comprehensive verification
chmod +x verify-setup.sh
./verify-setup.sh
```

> **For detailed verification procedures, see [SETUP-VERIFICATION.md](SETUP-VERIFICATION.md)**

### 4. Start Development Server

```bash
# Simple HTTP server for testing
python3 -m http.server 8080

# Or with live reload (if you have it)
npx live-server --port=8080
```

### 5. Open Test Pages
Navigate to:
- http://localhost:8080/src/html/test-workbook.html
- http://localhost:8080/src/html/test-graph.html
- http://localhost:8080/src/html/test-highcharts.html

> **For detailed testing procedures, see [SETUP-VERIFICATION.md](SETUP-VERIFICATION.md)**

## 🚀 Alternative Setup Methods

### Option 1: Python HTTP Server (Recommended)

The easiest way to run SocialCalc is with a local HTTP server due to CORS restrictions with file:// URLs.

```bash
# Navigate to the project root
cd socialcalc-modernized-v2

# Python 3 (most common)
python3 -m http.server 8080

# OR Python 2 (if python3 not available)
python -m SimpleHTTPServer 8080
```

### Option 2: Node.js HTTP Server
```bash
# Install a simple server globally
npm install -g http-server

# Navigate to project root and start
cd socialcalc-modernized-v2
http-server -p 8080
```

### Option 3: PHP HTTP Server
```bash
cd socialcalc-modernized-v2
php -S localhost:8080
```

### Option 4: Direct File Access (Limited)

You can try opening files directly in your browser, but some features may not work due to CORS restrictions:

```bash
# Open any of these files directly in your browser:
file:///path/to/socialcalc-modernized-v2/src/html/test-workbook.html
file:///path/to/socialcalc-modernized-v2/src/html/test-graph.html
```

## 🔧 Common Issues and Solutions

### Port 8080 Already in Use
```bash
# Find what's using the port
lsof -i :8080

# Use a different port
python3 -m http.server 8081
```

### Permission Denied on verify-setup.sh
```bash
# Make script executable
chmod +x verify-setup.sh
```

### Node.js/npm Version Issues
```bash
# Update Node.js from nodejs.org
# Or use nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

### Python Module Import Errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements-test.txt
```

### Browser Compatibility Issues
- Use modern browsers: Chrome 60+, Firefox 55+, Safari 12+
- Enable JavaScript
- Check browser console (F12) for specific errors
- Try incognito/private mode to rule out extensions

## 💻 Development Workflow

### Daily Development
```bash
# 1. Activate environment
source venv/bin/activate

# 2. Quick health check
./verify-setup.sh

# 3. Start development server
python3 -m http.server 8080
```

### Before Committing Code
```bash
# Complete verification
./verify-setup.sh
python -m pytest tests/backend/ -v
```

### Production Deployment
```bash
# Full verification with coverage
./verify-setup.sh
python -m pytest tests/backend/ --cov=main
```

## 🧪 Testing the Application

### Test Files Available:

Once your server is running, visit: `http://localhost:8080/src/html/`

#### 1. **Multi-Sheet Workbook Test**
**URL:** `http://localhost:8080/src/html/test-workbook.html`
- **Tests:** Multi-sheet functionality, workbook controls

#### 2. **Graphing & Charts Test** 
**URL:** `http://localhost:8080/src/html/test-graph.html`
- **Tests:** Charting and graphing capabilities

#### 3. **Highcharts Integration**
**URL:** `http://localhost:8080/src/html/test-highcharts.html`
- **Tests:** Advanced charting with Highcharts library

#### 4. **Sparklines Test**
**URL:** `http://localhost:8080/src/html/test-sparklines.html`
- **Tests:** Small inline charts (sparklines)

> **For complete testing procedures and verification, see [SETUP-VERIFICATION.md](SETUP-VERIFICATION.md)**