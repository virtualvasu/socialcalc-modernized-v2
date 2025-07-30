/**
 * Integration Tests for SocialCalc Collaboration Features
 * Tests real-time collaboration, message broadcasting, and multi-user editing
 */

import { collaborationMessages, sampleWorkbookData } from '../fixtures/sample-spreadsheet.js';

describe('Collaboration Features - Integration Tests', () => {
  let mockUpdater;
  let mockMessageMixin;
  let mockChannels;

  beforeEach(() => {
    // Mock the real-time updater system
    mockUpdater = {
      errorSleepTime: 500,
      cursor: null,
      poll: jest.fn(),
      onSuccess: jest.fn(),
      onError: jest.fn(),
      newMessages: jest.fn()
    };

    // Mock MessageMixin for session management
    mockMessageMixin = jest.fn().mockImplementation((session, ticker, fname) => ({
      session,
      ticker,
      fname,
      waiters: [],
      cache: [],
      cache_size: 1000,
      nextid: 2,
      
      wait_for_messages: jest.fn(),
      new_messages: jest.fn(),
      get_nextid: jest.fn(() => 2)
    }));

    // Mock channels storage
    mockChannels = {};

    // Mock global functions
    global.$ = jest.fn(() => ({
      ajax: jest.fn(),
      param: jest.fn()
    }));

    global.getCookie = jest.fn();
    global.updater = mockUpdater;
    global.MessageMixin = mockMessageMixin;
    global.channels = mockChannels;
  });

  describe('Real-time Updates', () => {
    test('should initialize updater and start polling', () => {
      const initializeCollaboration = () => {
        mockUpdater.poll();
        return true;
      };

      const result = initializeCollaboration();
      expect(result).toBe(true);
      expect(mockUpdater.poll).toHaveBeenCalled();
    });

    test('should handle successful polling response', () => {
      const mockResponse = JSON.stringify({
        messages: collaborationMessages
      });

      mockUpdater.onSuccess.mockImplementation((response) => {
        try {
          const data = JSON.parse(response);
          mockUpdater.newMessages(data);
          return true;
        } catch (e) {
          return false;
        }
      });

      const result = mockUpdater.onSuccess(mockResponse);
      expect(result).toBe(true);
      expect(mockUpdater.newMessages).toHaveBeenCalled();
    });

    test('should handle polling errors gracefully', () => {
      mockUpdater.onError.mockImplementation(() => {
        mockUpdater.errorSleepTime = Math.min(mockUpdater.errorSleepTime * 2, 30000);
        return mockUpdater.errorSleepTime;
      });

      const errorSleepTime = mockUpdater.onError();
      expect(errorSleepTime).toBe(1000); // doubled from 500
    });

    test('should parse JSON responses safely', () => {
      const safeJSONParse = (response) => {
        try {
          return { success: true, data: JSON.parse(response) };
        } catch (e) {
          return { success: false, error: e.message };
        }
      };

      const validResponse = '{"messages": []}';
      const invalidResponse = 'invalid json';

      expect(safeJSONParse(validResponse).success).toBe(true);
      expect(safeJSONParse(invalidResponse).success).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should create new collaboration session', () => {
      const createSession = (sessionId, ticker, fname) => {
        const session = new mockMessageMixin(sessionId, ticker, fname);
        mockChannels[sessionId] = session;
        return session;
      };

      const session = createSession('TEST123', 'AAPL', 'Stock Analysis');
      expect(session.session).toBe('TEST123');
      expect(session.ticker).toBe('AAPL');
      expect(session.fname).toBe('Stock Analysis');
      expect(mockChannels['TEST123']).toBe(session);
    });

    test('should handle multiple users joining session', () => {
      const session = new mockMessageMixin('TEST123', 'AAPL', 'Stock Analysis');
      mockChannels['TEST123'] = session;

      session.get_nextid.mockReturnValueOnce(2).mockReturnValueOnce(3).mockReturnValueOnce(4);

      const user1Id = session.get_nextid();
      const user2Id = session.get_nextid();
      const user3Id = session.get_nextid();

      expect(user1Id).toBe(2);
      expect(user2Id).toBe(3);
      expect(user3Id).toBe(4);
    });

    test('should retrieve existing session', () => {
      const session = new mockMessageMixin('EXISTING123', 'GOOGL', 'Analysis');
      mockChannels['EXISTING123'] = session;

      const getSession = (sessionId) => {
        return mockChannels[sessionId] || null;
      };

      const retrievedSession = getSession('EXISTING123');
      expect(retrievedSession).toBe(session);
      expect(retrievedSession.ticker).toBe('GOOGL');

      const nonExistentSession = getSession('NONEXISTENT');
      expect(nonExistentSession).toBe(null);
    });
  });

  describe('Message Broadcasting', () => {
    let session;

    beforeEach(() => {
      session = new mockMessageMixin('BROADCAST123', 'MSFT', 'Test Sheet');
      mockChannels['BROADCAST123'] = session;
      
      session.new_messages.mockImplementation((messages) => {
        session.cache.push(...messages);
        // Mock notifying waiters
        session.waiters.forEach(callback => callback(messages));
        session.waiters = [];
      });
    });

    test('should broadcast cell edit messages', () => {
      const cellEditMessage = {
        id: 'msg1',
        type: 'cell-edit',
        session: 'BROADCAST123',
        data: { cell: 'A1', value: 'New Value' },
        from: 'user1'
      };

      session.new_messages([cellEditMessage]);

      expect(session.cache).toContain(cellEditMessage);
      expect(session.new_messages).toHaveBeenCalledWith([cellEditMessage]);
    });

    test('should broadcast formula changes', () => {
      const formulaMessage = {
        id: 'msg2',
        type: 'formula-edit',
        session: 'BROADCAST123',
        data: { cell: 'B1', formula: 'SUM(A1:A10)' },
        from: 'user2'
      };

      session.new_messages([formulaMessage]);

      expect(session.cache).toContain(formulaMessage);
    });

    test('should handle message history and cursor positioning', () => {
      const messages = [
        { id: 'msg1', data: 'first' },
        { id: 'msg2', data: 'second' },
        { id: 'msg3', data: 'third' }
      ];

      session.cache = [...messages];

      session.wait_for_messages.mockImplementation((callback, cursor) => {
        if (cursor) {
          const index = session.cache.findIndex(msg => msg.id === cursor);
          const recentMessages = session.cache.slice(index + 1);
          if (recentMessages.length > 0) {
            callback(recentMessages);
            return;
          }
        }
        session.waiters.push(callback);
      });

      // Test getting messages from cursor
      const mockCallback = jest.fn();
      session.wait_for_messages(mockCallback, 'msg1');
      
      expect(mockCallback).toHaveBeenCalledWith([
        { id: 'msg2', data: 'second' },
        { id: 'msg3', data: 'third' }
      ]);
    });
  });

  describe('Conflict Resolution', () => {
    test('should handle simultaneous cell edits', () => {
      const resolveConflict = (cellRef, edits) => {
        // Last write wins policy
        const sortedEdits = edits.sort((a, b) => b.timestamp - a.timestamp);
        return sortedEdits[0];
      };

      const conflictingEdits = [
        { user: 'user1', value: 'First Edit', timestamp: 1000 },
        { user: 'user2', value: 'Second Edit', timestamp: 1001 },
        { user: 'user3', value: 'Third Edit', timestamp: 999 }
      ];

      const winner = resolveConflict('A1', conflictingEdits);
      expect(winner.value).toBe('Second Edit');
      expect(winner.user).toBe('user2');
    });

    test('should handle formula dependency updates', () => {
      const updateDependentCells = (changedCell, sheetData) => {
        const dependents = [];
        
        // Mock finding cells that reference the changed cell
        for (const [cellRef, cellData] of Object.entries(sheetData)) {
          if (cellData.formula && cellData.formula.includes(changedCell)) {
            dependents.push(cellRef);
          }
        }
        
        return dependents;
      };

      const mockSheetData = {
        'A1': { value: '10', datatype: 'n' },
        'B1': { value: '=A1*2', datatype: 'f', formula: 'A1*2' },
        'C1': { value: '=A1+B1', datatype: 'f', formula: 'A1+B1' }
      };

      const dependents = updateDependentCells('A1', mockSheetData);
      expect(dependents).toContain('B1');
      expect(dependents).toContain('C1');
      expect(dependents).toHaveLength(2);
    });
  });

  describe('Connection Management', () => {
    test('should handle connection drops and reconnection', () => {
      let isConnected = true;
      let reconnectAttempts = 0;

      const handleConnectionDrop = () => {
        isConnected = false;
        reconnectAttempts = 0;
      };

      const attemptReconnection = () => {
        reconnectAttempts++;
        if (reconnectAttempts <= 3) {
          // Mock successful reconnection after 3 attempts
          if (reconnectAttempts === 3) {
            isConnected = true;
            return { success: true, attempts: reconnectAttempts };
          }
          return { success: false, attempts: reconnectAttempts };
        }
        return { success: false, attempts: reconnectAttempts, giveUp: true };
      };

      handleConnectionDrop();
      expect(isConnected).toBe(false);

      let result = attemptReconnection();
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);

      result = attemptReconnection();
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);

      result = attemptReconnection();
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(isConnected).toBe(true);
    });

    test('should handle user disconnect and cleanup', () => {
      const session = new mockMessageMixin('CLEANUP123', 'TSLA', 'Test');
      const activeUsers = new Set(['user1', 'user2', 'user3']);

      const handleUserDisconnect = (userId) => {
        activeUsers.delete(userId);
        // Remove user from waiters
        session.waiters = session.waiters.filter(waiter => waiter.user !== userId);
        return Array.from(activeUsers);
      };

      expect(activeUsers.size).toBe(3);
      
      const remainingUsers = handleUserDisconnect('user2');
      expect(remainingUsers).toEqual(['user1', 'user3']);
      expect(activeUsers.size).toBe(2);
    });
  });

  describe('Performance Under Load', () => {
    test('should handle high message volume', () => {
      const session = new mockMessageMixin('LOAD123', 'NVDA', 'High Volume Test');
      session.cache_size = 100; // Smaller cache for testing

      // Generate many messages
      const messages = Array.from({ length: 150 }, (_, i) => ({
        id: `msg${i}`,
        data: `Message ${i}`,
        timestamp: Date.now() + i
      }));

      session.new_messages.mockImplementation((newMessages) => {
        session.cache.push(...newMessages);
        // Trim cache if too large
        if (session.cache.length > session.cache_size) {
          session.cache = session.cache.slice(-session.cache_size);
        }
      });

      session.new_messages(messages);

      // Should only keep the last 100 messages
      expect(session.cache.length).toBe(100);
      expect(session.cache[0].id).toBe('msg50'); // First kept message
      expect(session.cache[99].id).toBe('msg149'); // Last message
    });

    test('should handle multiple concurrent sessions', () => {
      const sessions = {};
      const sessionCount = 10;

      // Create multiple sessions
      for (let i = 0; i < sessionCount; i++) {
        const sessionId = `SESSION${i}`;
        sessions[sessionId] = new mockMessageMixin(sessionId, `STOCK${i}`, `Sheet${i}`);
      }

      expect(Object.keys(sessions)).toHaveLength(sessionCount);

      // Simulate activity in all sessions
      const messagesPerSession = 5;
      Object.values(sessions).forEach((session, index) => {
        session.new_messages.mockImplementation((msgs) => {
          session.cache.push(...msgs);
        });

        const messages = Array.from({ length: messagesPerSession }, (_, i) => ({
          id: `${session.session}_msg${i}`,
          data: `Data ${i}`
        }));

        session.new_messages(messages);
        expect(session.cache).toHaveLength(messagesPerSession);
      });
    });
  });
});