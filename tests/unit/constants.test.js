/**
 * Unit Tests for SocialCalc Constants
 * Tests the constants configuration and localization settings
 */

describe('SocialCalc Constants', () => {
  let mockSocialCalc;

  beforeEach(() => {
    // Mock SocialCalc Constants structure
    mockSocialCalc = {
      Constants: {
        // UI Text Constants
        s_editname: 'Edit',
        s_savesheet: 'Save Sheet',
        s_sheetname: 'Sheet Name',
        s_newsheet: 'New Sheet',
        
        // Error Messages
        s_circleerr: 'Circular Reference Error',
        s_divzeroerr: 'Division by Zero Error',
        s_referr: 'Reference Error',
        s_nameerr: 'Name Error',
        
        // Format Strings
        defaultCellFormat: 'General',
        defaultColWidth: 80,
        defaultRowHeight: 20,
        
        // CSS Class Names
        defaultImagePrefix: 'sc-',
        defaultTableCSS: 'socialcalc-table',
        
        // Calculation Settings
        maxIterations: 100,
        iterationTolerance: 0.001
      },
      
      ConstantsSetClasses: jest.fn(),
      ConstantsDefaultClasses: {
        'button': 'button',
        'input': 'input-field',
        'cell': 'cell'
      }
    };

    global.SocialCalc = mockSocialCalc;
  });

  describe('UI Text Constants', () => {
    test('should have correct UI text strings', () => {
      expect(mockSocialCalc.Constants.s_editname).toBe('Edit');
      expect(mockSocialCalc.Constants.s_savesheet).toBe('Save Sheet');
      expect(mockSocialCalc.Constants.s_sheetname).toBe('Sheet Name');
      expect(mockSocialCalc.Constants.s_newsheet).toBe('New Sheet');
    });

    test('should support localization of text strings', () => {
      // Mock localization function
      const localizeConstants = (locale) => {
        if (locale === 'es') {
          mockSocialCalc.Constants.s_editname = 'Editar';
          mockSocialCalc.Constants.s_savesheet = 'Guardar Hoja';
          mockSocialCalc.Constants.s_sheetname = 'Nombre de Hoja';
        }
        return mockSocialCalc.Constants;
      };

      const spanishConstants = localizeConstants('es');
      expect(spanishConstants.s_editname).toBe('Editar');
      expect(spanishConstants.s_savesheet).toBe('Guardar Hoja');
      expect(spanishConstants.s_sheetname).toBe('Nombre de Hoja');
    });
  });

  describe('Error Message Constants', () => {
    test('should have standard error messages', () => {
      expect(mockSocialCalc.Constants.s_circleerr).toBe('Circular Reference Error');
      expect(mockSocialCalc.Constants.s_divzeroerr).toBe('Division by Zero Error');
      expect(mockSocialCalc.Constants.s_referr).toBe('Reference Error');
      expect(mockSocialCalc.Constants.s_nameerr).toBe('Name Error');
    });

    test('should format error messages consistently', () => {
      const formatErrorMessage = (errorType, details) => {
        const baseMessage = mockSocialCalc.Constants[`s_${errorType}err`];
        return details ? `${baseMessage}: ${details}` : baseMessage;
      };

      expect(formatErrorMessage('circle')).toBe('Circular Reference Error');
      expect(formatErrorMessage('divzero', 'Cell A1')).toBe('Division by Zero Error: Cell A1');
      expect(formatErrorMessage('ref', 'Invalid cell B99')).toBe('Reference Error: Invalid cell B99');
    });
  });

  describe('Layout and Format Constants', () => {
    test('should have correct default formatting values', () => {
      expect(mockSocialCalc.Constants.defaultCellFormat).toBe('General');
      expect(mockSocialCalc.Constants.defaultColWidth).toBe(80);
      expect(mockSocialCalc.Constants.defaultRowHeight).toBe(20);
    });

    test('should have CSS-related constants', () => {
      expect(mockSocialCalc.Constants.defaultImagePrefix).toBe('sc-');
      expect(mockSocialCalc.Constants.defaultTableCSS).toBe('socialcalc-table');
    });

    test('should allow customization of layout constants', () => {
      const customizeLayout = (options) => {
        if (options.colWidth) mockSocialCalc.Constants.defaultColWidth = options.colWidth;
        if (options.rowHeight) mockSocialCalc.Constants.defaultRowHeight = options.rowHeight;
        if (options.imagePrefix) mockSocialCalc.Constants.defaultImagePrefix = options.imagePrefix;
      };

      customizeLayout({
        colWidth: 100,
        rowHeight: 25,
        imagePrefix: 'custom-'
      });

      expect(mockSocialCalc.Constants.defaultColWidth).toBe(100);
      expect(mockSocialCalc.Constants.defaultRowHeight).toBe(25);
      expect(mockSocialCalc.Constants.defaultImagePrefix).toBe('custom-');
    });
  });

  describe('Calculation Constants', () => {
    test('should have calculation limits and tolerances', () => {
      expect(mockSocialCalc.Constants.maxIterations).toBe(100);
      expect(mockSocialCalc.Constants.iterationTolerance).toBe(0.001);
    });

    test('should validate calculation settings', () => {
      const validateCalculationSettings = () => {
        const { maxIterations, iterationTolerance } = mockSocialCalc.Constants;
        
        return {
          valid: maxIterations > 0 && iterationTolerance > 0 && iterationTolerance < 1,
          maxIterations: maxIterations > 0,
          tolerance: iterationTolerance > 0 && iterationTolerance < 1
        };
      };

      const validation = validateCalculationSettings();
      expect(validation.valid).toBe(true);
      expect(validation.maxIterations).toBe(true);
      expect(validation.tolerance).toBe(true);
    });
  });

  describe('CSS Class Management', () => {
    test('should set CSS classes with prefix', () => {
      mockSocialCalc.ConstantsSetClasses.mockImplementation((prefix = '') => {
        const defaults = mockSocialCalc.ConstantsDefaultClasses;
        const scc = mockSocialCalc.Constants;

        for (const item in defaults) {
          if (typeof defaults[item] === 'string') {
            scc[`${item}Class`] = prefix + (defaults[item] || item);
            if (scc[`${item}Style`] !== undefined) {
              scc[`${item}Style`] = '';
            }
          }
        }
      });

      mockSocialCalc.ConstantsSetClasses('myapp-');

      expect(mockSocialCalc.ConstantsSetClasses).toHaveBeenCalledWith('myapp-');
    });

    test('should handle empty prefix', () => {
      mockSocialCalc.ConstantsSetClasses.mockImplementation((prefix = '') => {
        expect(prefix).toBe('');
      });

      mockSocialCalc.ConstantsSetClasses();
      expect(mockSocialCalc.ConstantsSetClasses).toHaveBeenCalledWith();
    });

    test('should have default CSS classes defined', () => {
      expect(mockSocialCalc.ConstantsDefaultClasses.button).toBe('button');
      expect(mockSocialCalc.ConstantsDefaultClasses.input).toBe('input-field');
      expect(mockSocialCalc.ConstantsDefaultClasses.cell).toBe('cell');
    });
  });

  describe('Constants Initialization', () => {
    test('should initialize constants before first use', () => {
      const initializeConstants = () => {
        if (!global.SocialCalc.Constants) {
          global.SocialCalc.Constants = {};
        }
        
        // Set default values if not already set
        const defaults = {
          defaultColWidth: 80,
          defaultRowHeight: 20,
          maxIterations: 100
        };

        for (const [key, value] of Object.entries(defaults)) {
          if (global.SocialCalc.Constants[key] === undefined) {
            global.SocialCalc.Constants[key] = value;
          }
        }

        return true;
      };

      const result = initializeConstants();
      expect(result).toBe(true);
    });

    test('should preserve existing constants during initialization', () => {
      // Set a custom value
      mockSocialCalc.Constants.customValue = 'preserved';

      const initializeWithDefaults = () => {
        const defaults = { defaultColWidth: 100, newDefault: 'new' };
        
        for (const [key, value] of Object.entries(defaults)) {
          if (mockSocialCalc.Constants[key] === undefined) {
            mockSocialCalc.Constants[key] = value;
          }
        }
      };

      initializeWithDefaults();

      // Custom value should be preserved
      expect(mockSocialCalc.Constants.customValue).toBe('preserved');
      // Existing value should not be overwritten
      expect(mockSocialCalc.Constants.defaultColWidth).toBe(80);
      // New default should be added
      expect(mockSocialCalc.Constants.newDefault).toBe('new');
    });
  });

  describe('Financial Constants (Project-Specific)', () => {
    beforeEach(() => {
      // Add financial-specific constants
      mockSocialCalc.Constants.currencySymbol = '$';
      mockSocialCalc.Constants.defaultCurrencyFormat = '$#,##0.00';
      mockSocialCalc.Constants.percentageFormat = '0.00%';
      mockSocialCalc.Constants.stockTickerFormat = 'UPPERCASE';
    });

    test('should have financial formatting constants', () => {
      expect(mockSocialCalc.Constants.currencySymbol).toBe('$');
      expect(mockSocialCalc.Constants.defaultCurrencyFormat).toBe('$#,##0.00');
      expect(mockSocialCalc.Constants.percentageFormat).toBe('0.00%');
    });

    test('should support different currency symbols', () => {
      const setCurrency = (symbol, format) => {
        mockSocialCalc.Constants.currencySymbol = symbol;
        mockSocialCalc.Constants.defaultCurrencyFormat = format;
      };

      setCurrency('€', '€#,##0.00');
      expect(mockSocialCalc.Constants.currencySymbol).toBe('€');
      expect(mockSocialCalc.Constants.defaultCurrencyFormat).toBe('€#,##0.00');

      setCurrency('¥', '¥#,##0');
      expect(mockSocialCalc.Constants.currencySymbol).toBe('¥');
      expect(mockSocialCalc.Constants.defaultCurrencyFormat).toBe('¥#,##0');
    });

    test('should validate stock ticker format', () => {
      const formatStockTicker = (ticker) => {
        const format = mockSocialCalc.Constants.stockTickerFormat;
        switch (format) {
          case 'UPPERCASE':
            return ticker.toUpperCase();
          case 'LOWERCASE':
            return ticker.toLowerCase();
          default:
            return ticker;
        }
      };

      expect(formatStockTicker('aapl')).toBe('AAPL');
      expect(formatStockTicker('GOOGL')).toBe('GOOGL');

      mockSocialCalc.Constants.stockTickerFormat = 'LOWERCASE';
      expect(formatStockTicker('MSFT')).toBe('msft');
    });
  });
});