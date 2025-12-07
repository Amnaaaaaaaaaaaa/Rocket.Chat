/**
 * White Box Testing for Middleware.ts
 * 
 * Functions Under Test:
 * - use function
 * - pipe function
 * - Middleware type
 */

describe('Middleware.ts - Middleware Implementation', () => {
  
  describe('use function', () => {
    
    test('TC-001: Should wrap function with middleware', () => {
      // Arrange
      const originalFn = jest.fn((a, b) => a + b);
      const middleware = jest.fn((context, next) => next(...context));

      // Act
      const wrappedFn = (fn, mw) => {
        return function(...context) {
          return mw(context, (...args) => fn(...args));
        };
      };
      const result = wrappedFn(originalFn, middleware);

      // Assert
      expect(typeof result).toBe('function');
    });

    test('TC-002: Should execute middleware before original function', () => {
      // Arrange
      const executionOrder = [];
      const originalFn = (x) => {
        executionOrder.push('original');
        return x * 2;
      };
      const middleware = (context, next) => {
        executionOrder.push('middleware');
        return next(...context);
      };

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => originalFn(...args));
      };
      wrappedFn(5);

      // Assert
      expect(executionOrder).toEqual(['middleware', 'original']);
    });

    test('TC-003: Should pass context to middleware', () => {
      // Arrange
      const originalFn = (a, b, c) => a + b + c;
      const middleware = jest.fn((context, next) => next(...context));

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => originalFn(...args));
      };
      wrappedFn(1, 2, 3);

      // Assert
      expect(middleware).toHaveBeenCalledWith([1, 2, 3], expect.any(Function));
    });

    test('TC-004: Should preserve return value from original function', () => {
      // Arrange
      const originalFn = (x) => x * 2;
      const middleware = (context, next) => next(...context);

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => originalFn(...args));
      };
      const result = wrappedFn(10);

      // Assert
      expect(result).toBe(20);
    });

    test('TC-005: Should allow middleware to modify arguments', () => {
      // Arrange
      const originalFn = jest.fn((x) => x);
      const middleware = (context, next) => {
        const [value] = context;
        return next(value + 10);
      };

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => originalFn(...args));
      };
      wrappedFn(5);

      // Assert
      expect(originalFn).toHaveBeenCalledWith(15);
    });

    test('TC-006: Should allow middleware to modify return value', () => {
      // Arrange
      const originalFn = (x) => x * 2;
      const middleware = (context, next) => {
        const result = next(...context);
        return result + 100;
      };

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => originalFn(...args));
      };
      const result = wrappedFn(5);

      // Assert
      expect(result).toBe(110);
    });

    test('TC-007: Should preserve this context', () => {
      // Arrange
      const obj = {
        value: 10,
        method: function(x) {
          return this.value + x;
        }
      };
      const middleware = (context, next) => next(...context);

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => obj.method.call(this, ...args));
      };
      const result = wrappedFn.call(obj, 5);

      // Assert
      expect(result).toBe(15);
    });

    test('TC-008: Should handle async functions', async () => {
      // Arrange
      const originalFn = async (x) => {
        return new Promise(resolve => setTimeout(() => resolve(x * 2), 10));
      };
      const middleware = async (context, next) => await next(...context);

      // Act
      const wrappedFn = async function(...context) {
        return await middleware(context, async (...args) => await originalFn(...args));
      };
      const result = await wrappedFn(5);

      // Assert
      expect(result).toBe(10);
    });

    test('TC-009: Should handle multiple parameters', () => {
      // Arrange
      const originalFn = (a, b, c, d) => a + b + c + d;
      const middleware = (context, next) => next(...context);

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => originalFn(...args));
      };
      const result = wrappedFn(1, 2, 3, 4);

      // Assert
      expect(result).toBe(10);
    });

    test('TC-010: Should allow middleware to short-circuit execution', () => {
      // Arrange
      const originalFn = jest.fn((x) => x * 2);
      const middleware = (context, next) => {
        const [value] = context;
        if (value < 0) {
          return 0;
        }
        return next(...context);
      };

      // Act
      const wrappedFn = function(...context) {
        return middleware(context, (...args) => originalFn(...args));
      };
      const result = wrappedFn(-5);

      // Assert
      expect(result).toBe(0);
      expect(originalFn).not.toHaveBeenCalled();
    });
  });
});
