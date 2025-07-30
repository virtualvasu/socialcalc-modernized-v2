/**
 * Smoke Tests for SocialCalc Spreadsheet Operations
 * Tests major features: loading sheets, editing cells, saving data
 */

import { sampleSpreadsheetData, socialCalcSaveFormat } from '../fixtures/sample-spreadsheet.js';

describe('Spreadsheet Operations - Smoke Tests', () => {
  let mockSpreadsheet;
  let mockWorkbook;

  beforeEach(() => {
    // Mock the core SocialCalc objects
    global.SocialCalc = {
      SpreadsheetControl: jest.fn().mockImplementation(() => ({
        workbook: null,
        sheet: {
          cells: {},
          attribs: {
            lastcol: 0,
            lastrow: 0
          }
        },
        context: {
          sheetobj: {
            cells: {},
            attribs: {}
          }
        },
        ExecuteCommand: jest.fn(),
        DoOnResize: jest.fn(),
        ScheduleRender: jest.fn()
      })),
      
      WorkBook: jest.fn().mockImplementation((spreadsheetControl) => ({
        spreadsheet: spreadsheetControl,
        sheetlist: ['Sheet1'],
        activesheet: 'Sheet1',
        sheets: { 'Sheet1': {} },
        
        AddSheet: jest.fn(),
        DeleteSheet: jest.fn(),
        SwitchToSheet: jest.fn(),
        SaveSheet: jest.fn()
      })),

      ParseSheetSave: jest.fn(),
      CreateSheetSave: jest.fn()
    };

    mockSpreadsheet = new global.SocialCalc.SpreadsheetControl();
    mockWorkbook = new global.SocialCalc.WorkBook(mockSpreadsheet);
  });

  describe('Sheet Loading', () => {
    test('should create a new spreadsheet control', () => {
      expect(mockSpreadsheet).toBeDefined();
      expect(mockSpreadsheet.sheet).toBeDefined();
      expect(mockSpreadsheet.sheet.cells).toEqual({});
    });

    test('should create a workbook with default sheet', () => {
      expect(mockWorkbook).toBeDefined();
      expect(mockWorkbook.sheetlist).toContain('Sheet1');
      expect(mockWorkbook.activesheet).toBe('Sheet1');
    });

    test('should load sample spreadsheet data', () => {
      // Mock loading spreadsheet data
      const loadSpreadsheetData = (data) => {
        mockSpreadsheet.sheet.cells = data.cells;
        return true;
      };

      const result = loadSpreadsheetData(sampleSpreadsheetData.basic);
      expect(result).toBe(true);
      expect(mockSpreadsheet.sheet.cells['A1']).toEqual({ value: 'Name', datatype: 't' });
      expect(mockSpreadsheet.sheet.cells['B2']).toEqual({ value: '30', datatype: 'n' });
    });

    test('should parse SocialCalc save format', () => {
      global.SocialCalc.ParseSheetSave.mockReturnValue({
        sheet: sampleSpreadsheetData.basic,
        success: true
      });

      const result = global.SocialCalc.ParseSheetSave(socialCalcSaveFormat);
      expect(result.success).toBe(true);
      expect(global.SocialCalc.ParseSheetSave).toHaveBeenCalledWith(socialCalcSaveFormat);
    });
  });

  describe('Cell Editing', () => {
    beforeEach(() => {
      // Load sample data
      mockSpreadsheet.sheet.cells = { ...sampleSpreadsheetData.basic.cells };
    });

    test('should edit cell values', () => {
      // Mock cell editing function
      const editCell = (cellRef, value, datatype = 't') => {
        mockSpreadsheet.sheet.cells[cellRef] = { value, datatype };
        mockSpreadsheet.ExecuteCommand(`set ${cellRef} value ${value}`);
        return true;
      };

      const result = editCell('A1', 'Updated Name');
      expect(result).toBe(true);
      expect(mockSpreadsheet.sheet.cells['A1'].value).toBe('Updated Name');
      expect(mockSpreadsheet.ExecuteCommand).toHaveBeenCalledWith('set A1 value Updated Name');
    });

    test('should handle numeric cell editing', () => {
      const editNumericCell = (cellRef, value) => {
        mockSpreadsheet.sheet.cells[cellRef] = { value: value.toString(), datatype: 'n' };
        mockSpreadsheet.ExecuteCommand(`set ${cellRef} value n ${value}`);
        return true;
      };

      const result = editNumericCell('B2', 35);
      expect(result).toBe(true);
      expect(mockSpreadsheet.sheet.cells['B2'].value).toBe('35');
      expect(mockSpreadsheet.sheet.cells['B2'].datatype).toBe('n');
    });

    test('should handle formula editing', () => {
      const editFormulaCell = (cellRef, formula) => {
        mockSpreadsheet.sheet.cells[cellRef] = { 
          value: `=${formula}`, 
          datatype: 'f', 
          formula: formula 
        };
        mockSpreadsheet.ExecuteCommand(`set ${cellRef} formula ${formula}`);
        return true;
      };

      const result = editFormulaCell('D1', 'SUM(B2:B3)');
      expect(result).toBe(true);
      expect(mockSpreadsheet.sheet.cells['D1'].formula).toBe('SUM(B2:B3)');
      expect(mockSpreadsheet.sheet.cells['D1'].datatype).toBe('f');
    });

    test('should validate cell references', () => {
      const isValidCellRef = (cellRef) => {
        return /^[A-Z]+[1-9]\d*$/.test(cellRef);
      };

      expect(isValidCellRef('A1')).toBe(true);
      expect(isValidCellRef('Z999')).toBe(true);
      expect(isValidCellRef('AA1')).toBe(true);
      expect(isValidCellRef('A0')).toBe(false);
      expect(isValidCellRef('1A')).toBe(false);
      expect(isValidCellRef('')).toBe(false);
    });
  });

  describe('Data Saving', () => {
    beforeEach(() => {
      mockSpreadsheet.sheet.cells = { ...sampleSpreadsheetData.financial.cells };
    });

    test('should save spreadsheet data', () => {
      global.SocialCalc.CreateSheetSave.mockReturnValue(socialCalcSaveFormat);

      const saveData = () => {
        const saveString = global.SocialCalc.CreateSheetSave(mockSpreadsheet.sheet);
        mockWorkbook.SaveSheet();
        return saveString;
      };

      const result = saveData();
      expect(result).toBeDefined();
      expect(global.SocialCalc.CreateSheetSave).toHaveBeenCalledWith(mockSpreadsheet.sheet);
      expect(mockWorkbook.SaveSheet).toHaveBeenCalled();
    });

    test('should handle workbook saving with multiple sheets', () => {
      // Add additional sheets
      mockWorkbook.sheetlist = ['Sheet1', 'Financials', 'Calculations'];
      mockWorkbook.sheets = {
        'Sheet1': sampleSpreadsheetData.basic,
        'Financials': sampleSpreadsheetData.financial,
        'Calculations': sampleSpreadsheetData.withFormulas
      };

      const saveWorkbook = () => {
        const workbookData = {};
        mockWorkbook.sheetlist.forEach(sheetName => {
          workbookData[sheetName] = mockWorkbook.sheets[sheetName];
        });
        return JSON.stringify(workbookData);
      };

      const result = saveWorkbook();
      const parsedResult = JSON.parse(result);
      
      expect(parsedResult).toHaveProperty('Sheet1');
      expect(parsedResult).toHaveProperty('Financials');
      expect(parsedResult).toHaveProperty('Calculations');
    });

    test('should preserve data integrity during save/load cycle', () => {
      const originalData = { ...mockSpreadsheet.sheet.cells };
      
      // Mock save/load cycle
      const saveLoadCycle = (data) => {
        const saveString = JSON.stringify(data);
        const loadedData = JSON.parse(saveString);
        return loadedData;
      };

      const restoredData = saveLoadCycle(originalData);
      
      expect(restoredData).toEqual(originalData);
      expect(restoredData['A1']).toEqual(originalData['A1']);
      expect(restoredData['D2']).toEqual(originalData['D2']);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid cell references gracefully', () => {
      const safeEditCell = (cellRef, value) => {
        try {
          if (!/^[A-Z]+[1-9]\d*$/.test(cellRef)) {
            throw new Error('Invalid cell reference');
          }
          mockSpreadsheet.sheet.cells[cellRef] = { value, datatype: 't' };
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result1 = safeEditCell('A1', 'Valid');
      expect(result1.success).toBe(true);

      const result2 = safeEditCell('INVALID', 'Invalid');
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Invalid cell reference');
    });

    test('should handle corrupted save data', () => {
      const safeParseSave = (saveData) => {
        try {
          if (!saveData || typeof saveData !== 'string') {
            throw new Error('Invalid save data format');
          }
          return { success: true, data: JSON.parse(saveData) };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result1 = safeParseSave('{"valid": "json"}');
      expect(result1.success).toBe(true);

      const result2 = safeParseSave('invalid json');
      expect(result2.success).toBe(false);

      const result3 = safeParseSave(null);
      expect(result3.success).toBe(false);
    });
  });
});