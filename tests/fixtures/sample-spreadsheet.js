/**
 * Test Fixtures for SocialCalc Spreadsheet Testing
 * Contains sample spreadsheet data and configurations
 */

export const sampleSpreadsheetData = {
  // Basic spreadsheet with simple data
  basic: {
    cells: {
      'A1': { value: 'Name', datatype: 't' },
      'B1': { value: 'Age', datatype: 't' },
      'C1': { value: 'Salary', datatype: 't' },
      'A2': { value: 'John', datatype: 't' },
      'B2': { value: '30', datatype: 'n' },
      'C2': { value: '50000', datatype: 'n' },
      'A3': { value: 'Jane', datatype: 't' },
      'B3': { value: '25', datatype: 'n' },
      'C3': { value: '45000', datatype: 'n' }
    },
    defaultColWidth: 80,
    defaultRowHeight: 20
  },

  // Spreadsheet with formulas
  withFormulas: {
    cells: {
      'A1': { value: '10', datatype: 'n' },
      'A2': { value: '20', datatype: 'n' },
      'A3': { value: '=A1+A2', datatype: 'f', formula: 'A1+A2' },
      'B1': { value: '5', datatype: 'n' },
      'B2': { value: '=A1*B1', datatype: 'f', formula: 'A1*B1' },
      'C1': { value: '=SUM(A1:A2)', datatype: 'f', formula: 'SUM(A1:A2)' }
    }
  },

  // Financial data (relevant to the project's focus)
  financial: {
    cells: {
      'A1': { value: 'Stock', datatype: 't' },
      'B1': { value: 'Price', datatype: 't' },
      'C1': { value: 'Shares', datatype: 't' },
      'D1': { value: 'Value', datatype: 't' },
      'A2': { value: 'AAPL', datatype: 't' },
      'B2': { value: '150.50', datatype: 'n' },
      'C2': { value: '100', datatype: 'n' },
      'D2': { value: '=B2*C2', datatype: 'f', formula: 'B2*C2' },
      'A3': { value: 'GOOGL', datatype: 't' },
      'B3': { value: '2500.75', datatype: 'n' },
      'C3': { value: '50', datatype: 'n' },
      'D3': { value: '=B3*C3', datatype: 'f', formula: 'B3*C3' },
      'D4': { value: '=SUM(D2:D3)', datatype: 'f', formula: 'SUM(D2:D3)' }
    }
  }
};

export const sampleWorkbookData = {
  sheets: {
    'Sheet1': sampleSpreadsheetData.basic,
    'Financials': sampleSpreadsheetData.financial,
    'Calculations': sampleSpreadsheetData.withFormulas
  },
  activeSheet: 'Sheet1'
};

// SocialCalc save format sample
export const socialCalcSaveFormat = `socialcalc:version:1.0
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=SocialCalcSpreadsheetControlSave
--SocialCalcSpreadsheetControlSave
Content-type: text/plain; charset=UTF-8

# SocialCalc Spreadsheet Control Save
version:1.0
part:sheet
--SocialCalcSpreadsheetControlSave
Content-type: text/plain; charset=UTF-8

version:1.5
cell:A1:t:Name
cell:B1:t:Age
cell:C1:t:Salary
cell:A2:t:John
cell:B2:n:30
cell:C2:n:50000
cell:A3:t:Jane
cell:B3:n:25
cell:C3:n:45000
sheet:c:3:r:3
--SocialCalcSpreadsheetControlSave--`;

// Mock collaboration messages
export const collaborationMessages = [
  {
    id: 'msg1',
    type: 'cell-edit',
    data: { cell: 'A1', value: 'Updated Value' },
    from: 'user1',
    timestamp: Date.now()
  },
  {
    id: 'msg2',
    type: 'sheet-save',
    data: { sheetData: 'compressed-sheet-data' },
    from: 'user2',
    timestamp: Date.now() + 1000
  }
];

// Stock data mock (for financial features)
export const mockStockData = {
  AAPL: {
    symbol: 'AAPL',
    price: 150.50,
    change: 2.30,
    changePercent: 1.55,
    volume: 1000000
  },
  GOOGL: {
    symbol: 'GOOGL',
    price: 2500.75,
    change: -15.25,
    changePercent: -0.61,
    volume: 500000
  }
};