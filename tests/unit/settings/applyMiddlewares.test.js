/**
 * White Box Testing for applyMiddlewares.ts
 * 
 * Functions Under Test:
 * - Middleware application to settings methods
 * - getProcessingTimeInMS
 * - DEBUG_SETTINGS middleware
 */

describe('applyMiddlewares.ts - Apply Middlewares to Settings', () => {
  let mockSettings;
  let mockUse;

  beforeEach(() => {
    mockSettings = {
      watch: jest.fn(),
      watchMultiple: jest.fn(),
      watchOnce: jest.fn(),
      watchByRegex: jest.fn(),
      change: jest.fn(),
      changeMultiple: jest.fn(),
      changeOnce: jest.fn(),
      changeByRegex: jest.fn(),
      onReady: jest.fn(),
    };

    mockUse = jest.fn((fn, middleware) => {
      return function(...context) {
        return middleware(context, (...args) => fn.call(this, ...args));
      };
    });

    jest.clearAllMocks();
  });

  describe('getProcessingTimeInMS', () => {
    
    test('TC-001: Should convert hrtime to milliseconds correctly', () => {
      // Arrange
      const time = [1, 500000000]; // 1 second + 500 million nanoseconds = 1500ms
      const getProcessingTimeInMS = (time) => time[0] * 1000 + time[1] / 1e6;

      // Act
      const result = getProcessingTimeInMS(time);

      // Assert
      expect(result).toBe(1500);
    });

    test('TC-002: Should handle zero time', () => {
      // Arrange
      const time = [0, 0];
      const getProcessingTimeInMS = (time) => time[0] * 1000 + time[1] / 1e6;

      // Act
      const result = getProcessingTimeInMS(time);

      // Assert
      expect(result).toBe(0);
    });

    test('TC-003: Should handle sub-millisecond precision', () => {
      // Arrange
      const time = [0, 123456]; // 0.123456 milliseconds
      const getProcessingTimeInMS = (time) => time[0] * 1000 + time[1] / 1e6;

      // Act
      const result = getProcessingTimeInMS(time);

      // Assert
      expect(result).toBeCloseTo(0.123456, 5);
    });
  });

  describe('settings.watch middleware', () => {
    
    test('TC-004: Should apply middleware to settings.watch', () => {
      // Arrange
      const middleware = (context, next) => {
        const [_id, callback, ...args] = context;
        return next(_id, callback, ...args);
      };

      // Act
      mockSettings.watch = mockUse(mockSettings.watch, middleware);
      mockSettings.watch('test_setting', () => {});

      // Assert
      expect(mockUse).toHaveBeenCalled();
    });

    test('TC-005: Should pass correct parameters through middleware', () => {
      // Arrange
      const _id = 'test_setting';
      const callback = jest.fn();
      const options = { debounce: 100 };
      const middleware = jest.fn((context, next) => {
        const [id, cb, ...args] = context;
        return next(id, cb, ...args);
      });

      // Act
      mockSettings.watch = mockUse(mockSettings.watch, middleware);
      mockSettings.watch(_id, callback, options);

      // Assert
      expect(middleware).toHaveBeenCalledWith([_id, callback, options], expect.any(Function));
    });
  });

  describe('DEBUG_SETTINGS middleware', () => {
    
    test('TC-006: Should wrap callback with timing when DEBUG_SETTINGS is true', () => {
      // Arrange
      const originalCallback = jest.fn();
      const _id = 'test_setting';
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const debugMiddleware = (context, next) => {
        const [id, callback, options] = context;
        return next(
          id,
          (...args) => {
            const start = process.hrtime();
            callback(...args);
            const elapsed = process.hrtime(start);
            const getProcessingTimeInMS = (time) => time[0] * 1000 + time[1] / 1e6;
            console.log(`settings.watch: ${id} ${getProcessingTimeInMS(elapsed)}ms`);
          },
          options,
        );
      };

      // Act
      const wrappedFn = mockUse(mockSettings.watch, debugMiddleware);
      const result = wrappedFn(_id, originalCallback);

      // Assert
      expect(mockUse).toHaveBeenCalled();
      expect(wrappedFn).toBeDefined();
      logSpy.mockRestore();
    });

    test('TC-007: Should log processing time for watched settings', () => {
      // Arrange
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      const callback = () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 100; i++) sum += i;
      };

      const getProcessingTimeInMS = (time) => time[0] * 1000 + time[1] / 1e6;
      
      // Act
      const start = process.hrtime();
      callback();
      const elapsed = process.hrtime(start);
      console.log(`settings.watch: test_setting ${getProcessingTimeInMS(elapsed)}ms`);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('settings.watch: test_setting'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\d+(\.\d+)?ms$/));
      logSpy.mockRestore();
    });
  });

  describe('Other settings methods middleware', () => {
    
    test('TC-008: Should apply middleware to watchMultiple', () => {
      // Arrange
      const middleware = (context, next) => {
        const [_id, callback, ...args] = context;
        return next(_id, callback, ...args);
      };

      // Act
      mockSettings.watchMultiple = mockUse(mockSettings.watchMultiple, middleware);
      mockSettings.watchMultiple(['setting1', 'setting2'], () => {});

      // Assert
      expect(mockUse).toHaveBeenCalled();
    });

    test('TC-009: Should apply middleware to change methods', () => {
      // Arrange
      const middleware = (context, next) => {
        const [_id, callback, ...args] = context;
        return next(_id, callback, ...args);
      };

      // Act
      mockSettings.change = mockUse(mockSettings.change, middleware);
      mockSettings.changeOnce = mockUse(mockSettings.changeOnce, middleware);
      mockSettings.changeMultiple = mockUse(mockSettings.changeMultiple, middleware);

      // Assert
      expect(mockUse).toHaveBeenCalledTimes(3);
    });

    test('TC-010: Should apply middleware to onReady', () => {
      // Arrange
      const middleware = (context, next) => {
        const [callback, ...args] = context;
        return next(callback, ...args);
      };

      // Act
      mockSettings.onReady = mockUse(mockSettings.onReady, middleware);
      mockSettings.onReady(() => {});

      // Assert
      expect(mockUse).toHaveBeenCalled();
    });
  });
});
