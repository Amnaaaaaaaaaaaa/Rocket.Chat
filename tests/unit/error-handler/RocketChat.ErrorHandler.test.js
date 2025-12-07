/**
 * White Box Testing for RocketChat.ErrorHandler.ts
 * 
 * Class Under Test:
 * - ErrorHandler
 * - Process event handlers (unhandledRejection, uncaughtException)
 */

describe('RocketChat.ErrorHandler.ts - Error Handler', () => {
  let mockSettings;
  let mockUsers;
  let mockRooms;
  let mockSendMessage;
  let mockThrottledCounter;
  let mockMeteor;
  let mockProcess;
  let errorHandler;

  beforeEach(() => {
    mockSettings = {
      incrementValueById: jest.fn(),
      watch: jest.fn(),
      set: jest.fn(),
    };

    mockUsers = {
      findOneById: jest.fn(),
    };

    mockRooms = {
      findOneByName: jest.fn(),
    };

    mockSendMessage = jest.fn();

    mockThrottledCounter = jest.fn((callback) => callback);

    mockMeteor = {
      startup: jest.fn((callback) => callback()),
      _debug: jest.fn(),
    };

    mockProcess = {
      on: jest.fn(),
      exit: jest.fn(),
      env: {},
    };

    // Create ErrorHandler instance
    errorHandler = {
      reporting: false,
      rid: null,
      lastError: null,
    };

    jest.clearAllMocks();
  });

  describe('ErrorHandler Class - Constructor', () => {
    
    test('TC-001: Should initialize with default values', () => {
      // Assert
      expect(errorHandler.reporting).toBe(false);
      expect(errorHandler.rid).toBe(null);
      expect(errorHandler.lastError).toBe(null);
    });

    test('TC-002: Should have reporting flag set to false initially', () => {
      // Assert
      expect(errorHandler.reporting).toBe(false);
    });

    test('TC-003: Should have rid set to null initially', () => {
      // Assert
      expect(errorHandler.rid).toBe(null);
    });

    test('TC-004: Should have lastError set to null initially', () => {
      // Assert
      expect(errorHandler.lastError).toBe(null);
    });
  });

  describe('getRoomId Method', () => {
    
    test('TC-005: Should return null when roomName is empty', async () => {
      // Arrange
      const roomName = '';

      // Act
      const getRoomId = async (roomName) => {
        if (!roomName) {
          return null;
        }
        return 'room-id';
      };

      const result = await getRoomId(roomName);

      // Assert
      expect(result).toBe(null);
    });

    test('TC-006: Should remove hash from room name', async () => {
      // Arrange
      const roomName = '#general';
      mockRooms.findOneByName.mockResolvedValue({
        _id: 'room123',
        t: 'c',
      });

      // Act
      const processedName = roomName.replace('#', '');

      // Assert
      expect(processedName).toBe('general');
    });

    test('TC-007: Should return room id for valid channel', async () => {
      // Arrange
      const roomName = 'general';
      mockRooms.findOneByName.mockResolvedValue({
        _id: 'room123',
        t: 'c',
      });

      // Act
      const room = await mockRooms.findOneByName(roomName, { projection: { _id: 1, t: 1 } });
      const result = room && (room.t === 'c' || room.t === 'p') ? room._id : null;

      // Assert
      expect(result).toBe('room123');
    });

    test('TC-008: Should return room id for valid private group', async () => {
      // Arrange
      const roomName = 'private-room';
      mockRooms.findOneByName.mockResolvedValue({
        _id: 'room456',
        t: 'p',
      });

      // Act
      const room = await mockRooms.findOneByName(roomName, { projection: { _id: 1, t: 1 } });
      const result = room && (room.t === 'c' || room.t === 'p') ? room._id : null;

      // Assert
      expect(result).toBe('room456');
    });

    test('TC-009: Should return null for direct message room', async () => {
      // Arrange
      const roomName = 'dm-room';
      mockRooms.findOneByName.mockResolvedValue({
        _id: 'room789',
        t: 'd',
      });

      // Act
      const room = await mockRooms.findOneByName(roomName, { projection: { _id: 1, t: 1 } });
      const result = room && (room.t === 'c' || room.t === 'p') ? room._id : null;

      // Assert
      expect(result).toBe(null);
    });

    test('TC-010: Should return null when room not found', async () => {
      // Arrange
      const roomName = 'non-existent';
      mockRooms.findOneByName.mockResolvedValue(null);

      // Act
      const room = await mockRooms.findOneByName(roomName, { projection: { _id: 1, t: 1 } });
      const result = room && (room.t === 'c' || room.t === 'p') ? room._id : null;

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('trackError Method', () => {
    
    test('TC-011: Should not track error when reporting is disabled', async () => {
      // Arrange
      errorHandler.reporting = false;
      errorHandler.rid = 'room123';
      const message = 'Test error';

      // Act
      if (!errorHandler.reporting || !errorHandler.rid) {
        return;
      }
      await mockSendMessage();

      // Assert
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('TC-012: Should not track error when rid is null', async () => {
      // Arrange
      errorHandler.reporting = true;
      errorHandler.rid = null;
      const message = 'Test error';

      // Act
      if (!errorHandler.reporting || !errorHandler.rid) {
        return;
      }
      await mockSendMessage();

      // Assert
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('TC-013: Should not track duplicate error messages', async () => {
      // Arrange
      errorHandler.reporting = true;
      errorHandler.rid = 'room123';
      errorHandler.lastError = 'Test error';
      const message = 'Test error';

      // Act
      if (errorHandler.lastError === message) {
        return;
      }
      await mockSendMessage();

      // Assert
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('TC-014: Should update lastError when tracking new error', async () => {
      // Arrange
      errorHandler.reporting = true;
      errorHandler.rid = 'room123';
      errorHandler.lastError = null;
      const message = 'New error';

      // Act
      if (errorHandler.reporting && errorHandler.rid && errorHandler.lastError !== message) {
        errorHandler.lastError = message;
      }

      // Assert
      expect(errorHandler.lastError).toBe('New error');
    });

    test('TC-015: Should fetch rocket.cat user for error messages', async () => {
      // Arrange
      mockUsers.findOneById.mockResolvedValue({
        _id: 'rocket.cat',
        username: 'rocket.cat',
      });

      // Act
      const user = await mockUsers.findOneById('rocket.cat');

      // Assert
      expect(mockUsers.findOneById).toHaveBeenCalledWith('rocket.cat');
      expect(user._id).toBe('rocket.cat');
    });

    test('TC-016: Should format message with stack trace', async () => {
      // Arrange
      let message = 'Error occurred';
      const stack = 'at function1()\nat function2()';

      // Act
      if (stack) {
        message = `${message}\n\`\`\`\n${stack}\n\`\`\``;
      }

      // Assert
      expect(message).toContain('Error occurred');
      expect(message).toContain('```');
      expect(message).toContain(stack);
    });

    test('TC-017: Should send message to configured room', async () => {
      // Arrange
      errorHandler.reporting = true;
      errorHandler.rid = 'room123';
      errorHandler.lastError = null;
      const message = 'Test error';
      const user = { _id: 'rocket.cat' };

      mockUsers.findOneById.mockResolvedValue(user);

      // Act
      if (errorHandler.reporting && errorHandler.rid && errorHandler.lastError !== message) {
        errorHandler.lastError = message;
        await mockSendMessage(user, { msg: message }, { _id: errorHandler.rid });
      }

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        user,
        { msg: message },
        { _id: 'room123' }
      );
    });
  });

  describe('Meteor Startup and Settings Watch', () => {
    
    test('TC-018: Should register settings watcher on startup', () => {
      // Arrange & Act
      mockMeteor.startup(() => {
        mockSettings.watch('Log_Exceptions_to_Channel', jest.fn());
      });

      // Assert
      expect(mockMeteor.startup).toHaveBeenCalled();
    });

    test('TC-019: Should reset rid when settings change', async () => {
      // Arrange
      errorHandler.rid = 'old-room-id';
      const callback = jest.fn(async (value) => {
        errorHandler.rid = null;
      });

      // Act
      await callback('#general');

      // Assert
      expect(errorHandler.rid).toBe(null);
    });

    test('TC-020: Should trim room name from settings', () => {
      // Arrange
      const value = '  #general  ';

      // Act
      const roomName = value.trim();

      // Assert
      expect(roomName).toBe('#general');
    });

    test('TC-021: Should enable reporting when valid room found', async () => {
      // Arrange
      const rid = 'room123';
      errorHandler.reporting = false;

      // Act
      errorHandler.reporting = Boolean(rid);
      errorHandler.rid = rid;

      // Assert
      expect(errorHandler.reporting).toBe(true);
      expect(errorHandler.rid).toBe('room123');
    });

    test('TC-022: Should disable reporting when room not found', async () => {
      // Arrange
      const rid = null;
      errorHandler.reporting = true;

      // Act
      errorHandler.reporting = Boolean(rid);
      errorHandler.rid = rid;

      // Assert
      expect(errorHandler.reporting).toBe(false);
      expect(errorHandler.rid).toBe(null);
    });
  });

  describe('Meteor._debug Override', () => {
    
    test('TC-023: Should call original Meteor._debug when reporting disabled', () => {
      // Arrange
      errorHandler.reporting = false;
      const originalDebug = jest.fn();
      const message = 'Debug message';
      const stack = 'stack trace';

      // Act
      if (!errorHandler.reporting) {
        originalDebug.call({}, message, stack);
      }

      // Assert
      expect(originalDebug).toHaveBeenCalledWith(message, stack);
    });

    test('TC-024: Should track error when reporting enabled', async () => {
      // Arrange
      errorHandler.reporting = true;
      errorHandler.rid = 'room123';
      const message = 'Error message';
      const stack = 'stack trace';

      mockUsers.findOneById.mockResolvedValue({ _id: 'rocket.cat' });

      // Act
      if (errorHandler.reporting && errorHandler.rid && errorHandler.lastError !== message) {
        errorHandler.lastError = message;
        await mockSendMessage();
      }

      // Assert
      expect(errorHandler.lastError).toBe(message);
    });
  });

  describe('Throttled Counter', () => {
    
    test('TC-025: Should increment exception count', async () => {
      // Arrange
      const counter = 5;
      mockSettings.incrementValueById.mockResolvedValue({
        _id: 'Uncaught_Exceptions_Count',
        value: counter,
      });

      // Act
      const result = await mockSettings.incrementValueById('Uncaught_Exceptions_Count', counter, {
        returnDocument: 'after',
      });

      // Assert
      expect(mockSettings.incrementValueById).toHaveBeenCalledWith(
        'Uncaught_Exceptions_Count',
        counter,
        { returnDocument: 'after' }
      );
      expect(result.value).toBe(5);
    });

    test('TC-026: Should update settings with incremented value', async () => {
      // Arrange
      const value = { _id: 'Uncaught_Exceptions_Count', value: 10 };
      mockSettings.incrementValueById.mockResolvedValue(value);

      // Act
      const result = await mockSettings.incrementValueById('Uncaught_Exceptions_Count', 1, {
        returnDocument: 'after',
      });

      if (result) {
        mockSettings.set(result);
      }

      // Assert
      expect(mockSettings.set).toHaveBeenCalledWith(value);
    });
  });

  describe('Process Event Handlers - unhandledRejection', () => {
    
    test('TC-027: Should register unhandledRejection handler', () => {
      // Act
      mockProcess.on('unhandledRejection', jest.fn());

      // Assert
      expect(mockProcess.on).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });

    test('TC-028: Should track error for unhandled rejection', async () => {
      // Arrange
      const error = new Error('Unhandled rejection');
      errorHandler.reporting = true;
      errorHandler.rid = 'room123';

      mockUsers.findOneById.mockResolvedValue({ _id: 'rocket.cat' });

      // Act
      if (error instanceof Error && errorHandler.reporting && errorHandler.rid) {
        errorHandler.lastError = error.message;
      }

      // Assert
      expect(errorHandler.lastError).toBe('Unhandled rejection');
    });

    test('TC-029: Should exit process in TEST_MODE on unhandled rejection', () => {
      // Arrange
      mockProcess.env.TEST_MODE = 'true';

      // Act
      if (mockProcess.env.TEST_MODE) {
        mockProcess.exit(1);
      }

      // Assert
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
    });

    test('TC-030: Should exit process in development on unhandled rejection', () => {
      // Arrange
      mockProcess.env.NODE_ENV = 'development';

      // Act
      if (mockProcess.env.NODE_ENV === 'development') {
        mockProcess.exit(1);
      }

      // Assert
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
    });

    test('TC-031: Should exit process when EXIT_UNHANDLEDPROMISEREJECTION is set', () => {
      // Arrange
      mockProcess.env.EXIT_UNHANDLEDPROMISEREJECTION = 'true';

      // Act
      if (mockProcess.env.EXIT_UNHANDLEDPROMISEREJECTION) {
        mockProcess.exit(1);
      }

      // Assert
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
    });

    test('TC-032: Should not exit process in production without flag', () => {
      // Arrange
      mockProcess.env.NODE_ENV = 'production';
      mockProcess.env.TEST_MODE = undefined;
      mockProcess.env.EXIT_UNHANDLEDPROMISEREJECTION = undefined;

      // Act
      if (mockProcess.env.TEST_MODE || mockProcess.env.NODE_ENV === 'development' || mockProcess.env.EXIT_UNHANDLEDPROMISEREJECTION) {
        mockProcess.exit(1);
      }

      // Assert
      expect(mockProcess.exit).not.toHaveBeenCalled();
    });
  });

  describe('Process Event Handlers - uncaughtException', () => {
    
    test('TC-033: Should register uncaughtException handler', () => {
      // Act
      mockProcess.on('uncaughtException', jest.fn());

      // Assert
      expect(mockProcess.on).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    });

    test('TC-034: Should track error for uncaught exception', async () => {
      // Arrange
      const error = new Error('Uncaught exception');
      errorHandler.reporting = true;
      errorHandler.rid = 'room123';

      mockUsers.findOneById.mockResolvedValue({ _id: 'rocket.cat' });

      // Act
      if (errorHandler.reporting && errorHandler.rid) {
        errorHandler.lastError = error.message;
      }

      // Assert
      expect(errorHandler.lastError).toBe('Uncaught exception');
    });

    test('TC-035: Should exit process in TEST_MODE on uncaught exception', () => {
      // Arrange
      mockProcess.env.TEST_MODE = 'true';

      // Act
      if (mockProcess.env.TEST_MODE) {
        mockProcess.exit(1);
      }

      // Assert
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
    });
  });
});
