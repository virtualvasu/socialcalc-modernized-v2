# SocialCalc Setup & Testing Guide

## 🚀 Quick Start

### Option 1: Simple HTTP Server (Recommended)

The easiest way to run SocialCalc is with a local HTTP server due to CORS restrictions with file:// URLs.

#### Using Python (if you have Python installed):
```bash
# Navigate to the project root
cd /home/virtu/c4gt/c4gt-20250728T155154Z-1-001/c4gt

# Python 3 (most common)
python3 -m http.server 8080

# OR Python 2 (if python3 not available)
python -m SimpleHTTPServer 8080
```

#### Using Node.js (if you have Node.js):
```bash
# Install a simple server globally
npm install -g http-server

# Navigate to project root and start
cd /home/virtu/c4gt/c4gt-20250728T155154Z-1-001/c4gt
http-server -p 8080
```

#### Using PHP (if you have PHP):
```bash
cd /home/virtu/c4gt/c4gt-20250728T155154Z-1-001/c4gt
php -S localhost:8080
```

### Option 2: Direct File Access (Limited)

You can try opening files directly in your browser, but some features may not work due to CORS restrictions:

```bash
# Open any of these files directly in your browser:
file:///home/virtu/c4gt/c4gt-20250728T155154Z-1-001/c4gt/src/html/test-workbook.html
file:///home/virtu/c4gt/c4gt-20250728T155154Z-1-001/c4gt/src/html/test-graph.html
```

## 🧪 Testing the Application

### Test Files Available:

Once your server is running, visit: `http://localhost:8080/src/html/`

#### 1. **Multi-Sheet Workbook Test**
**URL:** `http://localhost:8080/src/html/test-workbook.html`
- **Tests:** Multi-sheet functionality, workbook controls
- **Features:** Create sheets, switch between tabs, basic spreadsheet operations

#### 2. **Graphing & Charts Test** 
**URL:** `http://localhost:8080/src/html/test-graph.html`
- **Tests:** Charting and graphing capabilities
- **Features:** Data visualization, graph types, chart controls

#### 3. **Highcharts Integration**
**URL:** `http://localhost:8080/src/html/test-highcharts.html`
- **Tests:** Advanced charting with Highcharts library
- **Features:** Professional charts, export options

#### 4. **Sparklines Test**
**URL:** `http://localhost:8080/src/html/test-sparklines.html`
- **Tests:** Small inline charts (sparklines)
- **Features:** Compact data visualization

## 🔧 What to Test

### Basic Functionality:
1. **Cell Editing:**
   - Click on any cell
   - Enter numbers, text, or formulas (e.g., `=A1+B1`)
   - Press Enter to confirm

2. **Navigation:**
   - Use arrow keys to move between cells
   - Click and drag to select ranges
   - Use mouse wheel to scroll

3. **Formulas:**
   - Try: `=SUM(A1:A10)`
   - Try: `=AVERAGE(B1:B5)`  
   - Try: `=A1*B1+C1`

4. **Multi-Sheet (test-workbook.html):**
   - Look for sheet tabs at the bottom
   - Click to switch between sheets
   - Right-click for sheet options

5. **Graphing (test-graph.html):**
   - Enter data in cells
   - Select a range
   - Use graph controls to create charts

## 🐛 Common Issues & Solutions

### Issue: "Failed to load resource" or CORS errors
**Solution:** Use HTTP server instead of opening files directly

### Issue: jQuery or other scripts not loading
**Solution:** Check internet connection (jQuery loads from CDN)

### Issue: Blank page or no interface
**Solution:** Open browser developer tools (F12) to check for JavaScript errors

### Issue: Features not working
**Solution:** This is expected - not all JavaScript files have been fully modernized yet

## 🎯 Expected Behavior

### What Should Work:
✅ **Basic spreadsheet interface loads**  
✅ **Cell selection and navigation**  
✅ **Modern HTML5 layout and styling**  
✅ **Console shows modern JavaScript (no eval warnings)**  
✅ **DOM event handlers work properly**  
✅ **Responsive layout on mobile**

### What Might Not Work Yet:
⚠️ **Complex formulas** (formula-parser.js not fully modernized)  
⚠️ **Some UI interactions** (UI components partially modernized)  
⚠️ **Advanced features** (remaining components need modernization)  
⚠️ **Real-time collaboration** (needs server backend)

## 🔍 Debugging Tips

### Open Browser Developer Tools (F12):
1. **Console Tab:** Check for JavaScript errors
2. **Network Tab:** Verify all files are loading
3. **Elements Tab:** Inspect the modern HTML5 structure
4. **Sources Tab:** Browse the organized file structure

### Check Modern Features:
- Look for ES6+ syntax in loaded JavaScript files
- Verify HTML5 semantic elements (`<main>`, `<section>`)
- Confirm ARIA attributes for accessibility
- Check that jQuery 3.6.0 is loaded (not 1.3)

## 📱 Mobile Testing

The modernized HTML includes responsive design:
- Open on mobile browser
- Check viewport scaling
- Test touch interactions (if touch-interface.js is working)

## 🔗 File Structure for Testing

```
Your Server Root: /home/virtu/c4gt/c4gt-20250728T155154Z-1-001/c4gt/
├── src/html/          ← Test files are here
│   ├── test-workbook.html    ← Multi-sheet test
│   ├── test-graph.html       ← Graphing test  
│   ├── test-highcharts.html  ← Advanced charts
│   └── test-sparklines.html  ← Mini charts
├── src/js/            ← Modernized JavaScript
├── src/css/           ← Stylesheets
└── lib/vendor/        ← Third-party libraries
```

## 🏆 Success Indicators

You'll know the modernization is working when you see:
- ✅ Clean, modern HTML5 page layout
- ✅ No JavaScript eval() warnings in console
- ✅ Proper error handling and logging
- ✅ Mobile-responsive interface
- ✅ Modern developer tools integration

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify you're using an HTTP server (not file://)
3. Ensure internet connection for CDN resources
4. Try different browsers (Chrome, Firefox, Safari)

Happy testing! 🎉