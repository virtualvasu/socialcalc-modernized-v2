/**
 * Test suite for image-handler.js
 * Tests image embedding functionality including file uploads and URL images
 */

import { jest } from '@jest/globals';

// Mock the global SocialCalc object and its dependencies
const mockSocialCalc = {
  TableEditor: true,
  Constants: {
    defaultColWidth: 80
  },
  CmdGotFocus: jest.fn(),
  ScheduleSheetCommands: jest.fn(),
  GetCurrentWorkBookControl: jest.fn(() => ({
    currentSheetButton: { id: 'sheet1' }
  }))
};

// Mock workbook global
const mockWorkbook = {
  sheetArr: {
    sheet1: {
      sheet: {}
    }
  }
};

// Set up global mocks
global.SocialCalc = mockSocialCalc;
global.workbook = mockWorkbook;
global.window = global;
global.alert = jest.fn();

// Import the module after setting up mocks
const imageHandlerPath = '../../../src/js/visualization/image-handler.js';

describe('SocialCalc.getCellDetails', () => {
  beforeAll(async () => {
    // Dynamically import the module
    await import(imageHandlerPath);
  });

  it('should parse simple cell references correctly', () => {
    expect(SocialCalc.getCellDetails('A1')).toEqual([1, 1, 'A', '1']);
    expect(SocialCalc.getCellDetails('B2')).toEqual([2, 2, 'B', '2']);
    expect(SocialCalc.getCellDetails('Z26')).toEqual([26, 26, 'Z', '26']);
  });

  it('should parse multi-letter column references correctly', () => {
    expect(SocialCalc.getCellDetails('AA1')).toEqual([27, 1, 'AA', '1']);
    expect(SocialCalc.getCellDetails('AB10')).toEqual([28, 10, 'AB', '10']);
    expect(SocialCalc.getCellDetails('BA100')).toEqual([53, 100, 'BA', '100']);
  });

  it('should handle large row numbers', () => {
    expect(SocialCalc.getCellDetails('A1000')).toEqual([1, 1000, 'A', '1000']);
    expect(SocialCalc.getCellDetails('ZZ9999')).toEqual([702, 9999, 'ZZ', '9999']);
  });
});

describe('SocialCalc.getRange', () => {
  beforeAll(async () => {
    await import(imageHandlerPath);
  });

  it('should calculate range dimensions correctly', () => {
    expect(SocialCalc.getRange('A1:C3')).toEqual([3, 3]);
    expect(SocialCalc.getRange('B2:D5')).toEqual([3, 4]);
    expect(SocialCalc.getRange('A1:A5')).toEqual([1, 5]);
    expect(SocialCalc.getRange('A1:E1')).toEqual([5, 1]);
  });

  it('should handle single cell ranges', () => {
    expect(SocialCalc.getRange('A1:A1')).toEqual([1, 1]);
    expect(SocialCalc.getRange('B2:B2')).toEqual([1, 1]);
  });

  it('should handle larger ranges', () => {
    expect(SocialCalc.getRange('A1:Z26')).toEqual([26, 26]);
    expect(SocialCalc.getRange('AA1:AB10')).toEqual([2, 10]);
  });
});

describe('SocialCalc.Images', () => {
  beforeAll(async () => {
    await import(imageHandlerPath);
  });

  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default dimensions', () => {
      const images = new SocialCalc.Images();
      expect(images.height).toBe(0);
      expect(images.width).toBe(0);
    });
  });

  describe('Insert', () => {
    it('should show embed image dialog and focus range input', () => {
      // Setup DOM
      document.body.innerHTML = `
        <div id="EmbedImage" style="display: none;"></div>
        <input id="image-embed-range" />
      `;

      const embedImageEl = document.getElementById('EmbedImage');
      const rangeInputEl = document.getElementById('image-embed-range');

      SocialCalc.Images.Insert();

      expect(embedImageEl.style.display).toBe('inline');
      expect(SocialCalc.CmdGotFocus).toHaveBeenCalledWith(rangeInputEl);
    });

    it('should handle missing DOM elements gracefully', () => {
      expect(() => SocialCalc.Images.Insert()).not.toThrow();
    });
  });

  describe('showImgForm', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="localImgForm" style="display: none;"></div>
        <div id="urlImgForm" style="display: none;"></div>
        <input id="imgurl" />
        <button id="image-embed-submit-button" style="display: none;"></button>
        <button id="image-embed-cancel-button" style="display: none;"></button>
      `;
    });

    it('should show local form when value is "local"', () => {
      SocialCalc.Images.showImgForm('local');

      const localForm = document.getElementById('localImgForm');
      const urlForm = document.getElementById('urlImgForm');
      const submitBtn = document.getElementById('image-embed-submit-button');
      const cancelBtn = document.getElementById('image-embed-cancel-button');

      expect(localForm.style.display).toBe('inline');
      expect(urlForm.style.display).toBe('none');
      expect(submitBtn.style.display).toBe('inline');
      expect(cancelBtn.style.display).toBe('inline');
    });

    it('should show URL form and focus input when value is "url"', () => {
      SocialCalc.Images.showImgForm('url');

      const localForm = document.getElementById('localImgForm');
      const urlForm = document.getElementById('urlImgForm');
      const urlInput = document.getElementById('imgurl');
      const submitBtn = document.getElementById('image-embed-submit-button');
      const cancelBtn = document.getElementById('image-embed-cancel-button');

      expect(localForm.style.display).toBe('none');
      expect(urlForm.style.display).toBe('inline');
      expect(submitBtn.style.display).toBe('inline');
      expect(cancelBtn.style.display).toBe('inline');
      expect(SocialCalc.CmdGotFocus).toHaveBeenCalledWith(urlInput);
    });

    it('should handle missing DOM elements gracefully', () => {
      document.body.innerHTML = '';
      expect(() => SocialCalc.Images.showImgForm('url')).not.toThrow();
    });
  });

  describe('handleFileSelect', () => {
    let mockFileReader;

    beforeEach(() => {
      document.body.innerHTML = `
        <img id="file-image-holder" style="display: none;" />
        <div id="file-text-holder" style="display: inline;"></div>
      `;

      // Mock FileReader
      mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null,
        onerror: null,
        result: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      };

      global.FileReader = jest.fn(() => mockFileReader);

      // Spy on console methods
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle valid image files', () => {
      const mockFile = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [mockFile]
        }
      };

      SocialCalc.Images.handleFileSelect(event);

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('should skip non-image files', () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
      const event = {
        target: {
          files: [mockFile]
        }
      };

      SocialCalc.Images.handleFileSelect(event);

      expect(console.warn).toHaveBeenCalledWith('Skipping non-image file:', 'test.txt');
      expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
    });

    it('should handle no files selected', () => {
      const event = {
        target: {
          files: []
        }
      };

      SocialCalc.Images.handleFileSelect(event);

      expect(console.warn).toHaveBeenCalledWith('No files selected');
      expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
    });

    it('should update DOM when file is loaded successfully', () => {
      const mockFile = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [mockFile]
        }
      };

      SocialCalc.Images.handleFileSelect(event);

      // Simulate file load completion
      const loadEvent = { target: { result: mockFileReader.result } };
      mockFileReader.onload(loadEvent);

      const fileImageHolder = document.getElementById('file-image-holder');
      const fileTextHolder = document.getElementById('file-text-holder');

      expect(fileImageHolder.src).toBe(mockFileReader.result);
      expect(fileImageHolder.style.display).toBe('inline');
      expect(fileTextHolder.style.display).toBe('none');
      expect(fileImageHolder.className).toBe('thumb');
      expect(fileImageHolder.getAttribute('title')).toBe('test.png');
    });

    it('should handle missing DOM elements', () => {
      document.body.innerHTML = '';
      
      const mockFile = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [mockFile]
        }
      };

      SocialCalc.Images.handleFileSelect(event);

      // Simulate file load completion
      const loadEvent = { target: { result: mockFileReader.result } };
      mockFileReader.onload(loadEvent);

      expect(console.error).toHaveBeenCalledWith('Required DOM elements not found');
    });
  });

  describe('getUrlImage', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input id="imgurl" value="" />
        <img id="url-image-holder" style="display: none;" />
        <div id="url-text-holder" style="display: inline;"></div>
      `;

      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should load valid URL images', () => {
      const urlInput = document.getElementById('imgurl');
      urlInput.value = 'https://example.com/image.jpg';

      SocialCalc.Images.getUrlImage();

      const urlImageHolder = document.getElementById('url-image-holder');
      const urlTextHolder = document.getElementById('url-text-holder');

      expect(urlImageHolder.src).toBe('https://example.com/image.jpg');
      expect(urlImageHolder.style.display).toBe('inline');
      expect(urlTextHolder.style.display).toBe('none');
    });

    it('should handle empty URL', () => {
      const urlInput = document.getElementById('imgurl');
      urlInput.value = '';

      SocialCalc.Images.getUrlImage();

      expect(console.warn).toHaveBeenCalledWith('No URL provided');
    });

    it('should handle invalid URL', () => {
      const urlInput = document.getElementById('imgurl');
      urlInput.value = 'invalid-url';

      SocialCalc.Images.getUrlImage();

      expect(console.error).toHaveBeenCalledWith('Invalid URL:', 'invalid-url');
    });

    it('should handle missing DOM elements', () => {
      document.body.innerHTML = '';

      expect(() => SocialCalc.Images.getUrlImage()).not.toThrow();
      expect(console.error).toHaveBeenCalledWith('Required DOM elements not found');
    });
  });

  describe('Embed', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input id="img-file-inp" value="" />
        <img id="file-image-holder" src="" width="160" height="120" />
        <img id="url-image-holder" src="https://example.com/image.jpg" width="200" height="150" />
        <input id="image-embed-range" value="A1:C3" />
        <input id="imgurl" value="" />
        <div id="localImgForm"></div>
        <div id="urlImgForm"></div>
        <button id="embed-button"></button>
        <div id="EmbedImage"></div>
      `;

      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should embed URL image successfully', () => {
      SocialCalc.Images.Embed();

      const expectedCommand = 'merge A1:C3\nset A1 textvalueformat text-html\nset A1 text t <img src="https://example.com/image.jpg" style="height:60px;"/>';
      
      expect(SocialCalc.ScheduleSheetCommands).toHaveBeenCalledWith(
        mockWorkbook.sheetArr.sheet1.sheet,
        expectedCommand,
        true,
        true
      );
    });

    it('should handle missing range', () => {
      const rangeInput = document.getElementById('image-embed-range');
      rangeInput.value = '';

      SocialCalc.Images.Embed();

      expect(console.error).toHaveBeenCalledWith('No range specified');
      expect(SocialCalc.ScheduleSheetCommands).not.toHaveBeenCalled();
    });

    it('should handle missing image source', () => {
      const urlImageHolder = document.getElementById('url-image-holder');
      const fileImageHolder = document.getElementById('file-image-holder');
      // Set width to 0 to simulate no image
      urlImageHolder.width = 0;
      fileImageHolder.width = 0;
      urlImageHolder.removeAttribute('src');
      fileImageHolder.removeAttribute('src');

      SocialCalc.Images.Embed();

      expect(console.error).toHaveBeenCalledWith('No image source available');
      expect(SocialCalc.ScheduleSheetCommands).not.toHaveBeenCalled();
    });

    it('should clean up form after successful embed', () => {
      SocialCalc.Images.Embed();

      const fileInput = document.getElementById('img-file-inp');
      const rangeInput = document.getElementById('image-embed-range');
      const fileImageHolder = document.getElementById('file-image-holder');
      const urlImageHolder = document.getElementById('url-image-holder');

      expect(fileInput.value).toBe('');
      expect(rangeInput.value).toBe('');
      // In JSDOM, setting src to empty string results in 'http://localhost/'
      expect(fileImageHolder.src).toBe('http://localhost/');
      expect(urlImageHolder.src).toBe('http://localhost/');
    });

    it('should handle missing DOM elements', () => {
      document.body.innerHTML = '';

      expect(() => SocialCalc.Images.Embed()).not.toThrow();
      expect(console.error).toHaveBeenCalledWith('Required DOM elements not found');
    });
  });

  describe('hideImgForm', () => {
    it('should hide embed image form', () => {
      document.body.innerHTML = `
        <div id="EmbedImage" style="display: inline;"></div>
      `;

      SocialCalc.Images.hideImgForm();

      const embedImageEl = document.getElementById('EmbedImage');
      expect(embedImageEl.style.display).toBe('none');
    });

    it('should handle missing DOM elements gracefully', () => {
      expect(() => SocialCalc.Images.hideImgForm()).not.toThrow();
    });
  });

  describe('_cleanupForm', () => {
    it('should clean up all form elements', () => {
      document.body.innerHTML = `
        <input id="img-file-inp" value="test" />
        <input id="image-embed-range" value="A1:B2" />
        <img id="file-image-holder" src="test.jpg" style="display: inline;" />
        <img id="url-image-holder" src="test2.jpg" style="display: inline;" />
        <input id="imgurl" value="http://test.com" />
        <div id="localImgForm" style="display: inline;"></div>
        <div id="urlImgForm" style="display: inline;"></div>
        <button id="embed-button" style="display: inline;"></button>
        <div id="EmbedImage" style="display: inline;"></div>
      `;

      const ifi = document.getElementById('img-file-inp');
      const fih = document.getElementById('file-image-holder');
      const uih = document.getElementById('url-image-holder');
      const ier = document.getElementById('image-embed-range');

      SocialCalc.Images._cleanupForm(ifi, fih, uih, ier);

      expect(ifi.value).toBe('');
      expect(ier.value).toBe('');
      // In JSDOM, setting src to empty string results in 'http://localhost/'
      expect(fih.src).toBe('http://localhost/');
      expect(fih.style.display).toBe('none');
      expect(uih.src).toBe('http://localhost/');
      expect(uih.style.display).toBe('none');

      const elementsToCheck = [
        'imgurl', 'localImgForm', 'urlImgForm', 
        'embed-button', 'EmbedImage'
      ];

      elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        if (id === 'imgurl') {
          expect(element.value).toBe('');
        } else {
          expect(element.style.display).toBe('none');
        }
      });
    });
  });
});
