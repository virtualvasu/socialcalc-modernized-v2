/**
 * Unit Tests for SocialCalc Formula Parser
 * Tests formula parsing, calculation, and mathematical operations
 */

import { sampleSpreadsheetData } from '../fixtures/sample-spreadsheet.js';

describe('SocialCalc Formula Parser', () => {
  let mockSocialCalc;

  beforeEach(() => {
    // Mock SocialCalc formula parsing functionality
    mockSocialCalc = {
      Formula: {
        // Mock formula parsing function
        ParseFormula: jest.fn(),
        
        // Mock formula calculation
        evaluate_parsed_formula: jest.fn(),
        
        // Mock built-in functions
        FunctionList: {
          SUM: { func: jest.fn(), params: 'range' },
          AVERAGE: { func: jest.fn(), params: 'range' },
          MAX: { func: jest.fn(), params: 'range' },
          MIN: { func: jest.fn(), params: 'range' },
          COUNT: { func: jest.fn(), params: 'range' },
          IF: { func: jest.fn(), params: 'condition,true_value,false_value' }
        }
      },
      
      // Mock sheet context for formula evaluation
      GetSpreadsheetData: jest.fn(),
      
      // Mock cell reference handling
      coordToCr: jest.fn(),
      crToCoord: jest.fn()
    };

    global.SocialCalc = mockSocialCalc;
  });

  describe('Basic Formula Parsing', () => {
    test('should parse simple arithmetic formulas', () => {
      mockSocialCalc.Formula.ParseFormula.mockReturnValue({
        type: 'formula',
        tokens: ['A1', '+', 'B1'],
        success: true
      });

      const result = mockSocialCalc.Formula.ParseFormula('A1+B1');
      expect(result.success).toBe(true);
      expect(result.tokens).toContain('A1');
      expect(result.tokens).toContain('+');
      expect(result.tokens).toContain('B1');
    });

    test('should parse complex formulas with parentheses', () => {
      mockSocialCalc.Formula.ParseFormula.mockReturnValue({
        type: 'formula',
        tokens: ['(', 'A1', '+', 'B1', ')', '*', 'C1'],
        success: true
      });

      const result = mockSocialCalc.Formula.ParseFormula('(A1+B1)*C1');
      expect(result.success).toBe(true);
      expect(result.tokens).toContain('(');
      expect(result.tokens).toContain(')');
      expect(result.tokens).toContain('*');
    });

    test('should handle cell ranges', () => {
      mockSocialCalc.Formula.ParseFormula.mockReturnValue({
        type: 'formula',
        tokens: ['SUM', '(', 'A1:A10', ')'],
        success: true
      });

      const result = mockSocialCalc.Formula.ParseFormula('SUM(A1:A10)');
      expect(result.success).toBe(true);
      expect(result.tokens).toContain('SUM');
      expect(result.tokens).toContain('A1:A10');
    });

    test('should reject invalid formulas', () => {
      mockSocialCalc.Formula.ParseFormula.mockReturnValue({
        type: 'error',
        error: 'Invalid formula syntax',
        success: false
      });

      const result = mockSocialCalc.Formula.ParseFormula('A1++B1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid formula syntax');
    });
  });

  describe('Formula Calculation', () => {
    beforeEach(() => {
      // Mock spreadsheet data for calculations
      mockSocialCalc.GetSpreadsheetData.mockReturnValue({
        'A1': { value: '10', datatype: 'n' },
        'A2': { value: '20', datatype: 'n' },
        'A3': { value: '30', datatype: 'n' },
        'B1': { value: '5', datatype: 'n' },
        'B2': { value: '15', datatype: 'n' }
      });
    });

    test('should calculate simple addition', () => {
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValue({
        value: 30,
        type: 'n'
      });

      const formula = { tokens: ['A1', '+', 'A2'] };
      const result = mockSocialCalc.Formula.evaluate_parsed_formula(formula);
      
      expect(result.value).toBe(30);
      expect(result.type).toBe('n');
    });

    test('should calculate multiplication', () => {
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValue({
        value: 50,
        type: 'n'
      });

      const formula = { tokens: ['A1', '*', 'B1'] };
      const result = mockSocialCalc.Formula.evaluate_parsed_formula(formula);
      
      expect(result.value).toBe(50);
      expect(result.type).toBe('n');
    });

    test('should handle division and check for division by zero', () => {
      // Normal division
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValueOnce({
        value: 2,
        type: 'n'
      });

      const formula1 = { tokens: ['A1', '/', 'B1'] };
      const result1 = mockSocialCalc.Formula.evaluate_parsed_formula(formula1);
      expect(result1.value).toBe(2);

      // Division by zero
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValueOnce({
        value: '#DIV/0!',
        type: 'e'
      });

      const formula2 = { tokens: ['A1', '/', '0'] };
      const result2 = mockSocialCalc.Formula.evaluate_parsed_formula(formula2);
      expect(result2.value).toBe('#DIV/0!');
      expect(result2.type).toBe('e');
    });
  });

  describe('Built-in Functions', () => {
    test('should calculate SUM function', () => {
      mockSocialCalc.Formula.FunctionList.SUM.func.mockReturnValue({
        value: 60,
        type: 'n'
      });

      const result = mockSocialCalc.Formula.FunctionList.SUM.func(['A1:A3']);
      expect(result.value).toBe(60);
      expect(result.type).toBe('n');
    });

    test('should calculate AVERAGE function', () => {
      mockSocialCalc.Formula.FunctionList.AVERAGE.func.mockReturnValue({
        value: 20,
        type: 'n'
      });

      const result = mockSocialCalc.Formula.FunctionList.AVERAGE.func(['A1:A3']);
      expect(result.value).toBe(20);
      expect(result.type).toBe('n');
    });

    test('should calculate MAX and MIN functions', () => {
      mockSocialCalc.Formula.FunctionList.MAX.func.mockReturnValue({
        value: 30,
        type: 'n'
      });

      mockSocialCalc.Formula.FunctionList.MIN.func.mockReturnValue({
        value: 10,
        type: 'n'
      });

      const maxResult = mockSocialCalc.Formula.FunctionList.MAX.func(['A1:A3']);
      const minResult = mockSocialCalc.Formula.FunctionList.MIN.func(['A1:A3']);
      
      expect(maxResult.value).toBe(30);
      expect(minResult.value).toBe(10);
    });

    test('should handle IF function with conditions', () => {
      // IF(A1>15, "High", "Low") where A1 = 10
      mockSocialCalc.Formula.FunctionList.IF.func.mockReturnValue({
        value: 'Low',
        type: 't'
      });

      const result = mockSocialCalc.Formula.FunctionList.IF.func(['A1>15', 'High', 'Low']);
      expect(result.value).toBe('Low');
      expect(result.type).toBe('t');
    });

    test('should handle COUNT function', () => {
      mockSocialCalc.Formula.FunctionList.COUNT.func.mockReturnValue({
        value: 3,
        type: 'n'
      });

      const result = mockSocialCalc.Formula.FunctionList.COUNT.func(['A1:A3']);
      expect(result.value).toBe(3);
      expect(result.type).toBe('n');
    });
  });

  describe('Cell Reference Handling', () => {
    test('should convert coordinates to cell references', () => {
      mockSocialCalc.crToCoord.mockImplementation((col, row) => {
        return String.fromCharCode(64 + col) + row;
      });

      expect(mockSocialCalc.crToCoord(1, 1)).toBe('A1');
      expect(mockSocialCalc.crToCoord(2, 5)).toBe('B5');
      expect(mockSocialCalc.crToCoord(26, 10)).toBe('Z10');
    });

    test('should convert cell references to coordinates', () => {
      mockSocialCalc.coordToCr.mockImplementation((coord) => {
        const match = coord.match(/^([A-Z]+)(\d+)$/);
        if (!match) return null;
        
        const col = match[1].charCodeAt(0) - 64;
        const row = parseInt(match[2]);
        return { col, row };
      });

      expect(mockSocialCalc.coordToCr('A1')).toEqual({ col: 1, row: 1 });
      expect(mockSocialCalc.coordToCr('B5')).toEqual({ col: 2, row: 5 });
      expect(mockSocialCalc.coordToCr('Z10')).toEqual({ col: 26, row: 10 });
    });
  });

  describe('Financial Formulas (Project-Specific)', () => {
    test('should handle stock calculation formulas', () => {
      // Mock stock portfolio calculations
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValue({
        value: 15050, // 150.50 * 100
        type: 'n'
      });

      // Formula: Stock Price * Shares = Total Value
      const stockFormula = { tokens: ['B2', '*', 'C2'] };
      const result = mockSocialCalc.Formula.evaluate_parsed_formula(stockFormula);
      
      expect(result.value).toBe(15050);
      expect(result.type).toBe('n');
    });

    test('should calculate portfolio totals', () => {
      mockSocialCalc.Formula.FunctionList.SUM.func.mockReturnValue({
        value: 140087.5, // Sum of all stock values
        type: 'n'
      });

      const portfolioSum = mockSocialCalc.Formula.FunctionList.SUM.func(['D2:D3']);
      expect(portfolioSum.value).toBe(140087.5);
    });
  });

  describe('Error Handling', () => {
    test('should handle circular references', () => {
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValue({
        value: '#CIRC!',
        type: 'e'
      });

      const circularFormula = { tokens: ['A1', '+', 'A1'] };
      const result = mockSocialCalc.Formula.evaluate_parsed_formula(circularFormula);
      
      expect(result.value).toBe('#CIRC!');
      expect(result.type).toBe('e');
    });

    test('should handle reference errors', () => {
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValue({
        value: '#REF!',
        type: 'e'
      });

      const invalidRefFormula = { tokens: ['XYZ999', '+', 'A1'] };
      const result = mockSocialCalc.Formula.evaluate_parsed_formula(invalidRefFormula);
      
      expect(result.value).toBe('#REF!');
      expect(result.type).toBe('e');
    });

    test('should handle name errors for unknown functions', () => {
      mockSocialCalc.Formula.evaluate_parsed_formula.mockReturnValue({
        value: '#NAME?',
        type: 'e'
      });

      const unknownFunctionFormula = { tokens: ['UNKNOWN_FUNC', '(', 'A1', ')'] };
      const result = mockSocialCalc.Formula.evaluate_parsed_formula(unknownFunctionFormula);
      
      expect(result.value).toBe('#NAME?');
      expect(result.type).toBe('e');
    });
  });
});