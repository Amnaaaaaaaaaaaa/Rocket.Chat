/**
 * Logger Middleware - White-Box Testing
 * Tests: loggerMiddleware functionality
 * Total: 10 tests
 */

const { loggerMiddleware } = require('../src/api/middleware/logger');

describe('Logger Middleware - White-Box Testing', () => {
  let c, next, mockLogger, mockChildLogger;

  beforeEach(() => {
    mockChildLogger = {
      http: jest.fn()
    };
    mockLogger = {
      logger: {
        child: jest.fn().mockReturnValue(mockChildLogger)
      }
    };
    c = {
      req: {
        method: 'GET',
        url: 'http://localhost/api/test',
        header: jest.fn(),
        raw: {
          clone: jest.fn().mockReturnValue({
            json: jest.fn().mockResolvedValue({ key: 'value' })
          })
        }
      },
      res: {
        status: 200
      },
      get: jest.fn().mockReturnValue('192.168.1.1')
    };
    next = jest.fn();
  });

  test('TC-LOG-001: should create child logger with request details', async () => {
    c.req.header.mockImplementation((name) => {
      const headers = {
        'x-user-id': 'user123',
        'user-agent': 'Mozilla',
        'content-length': '100',
        'host': 'localhost',
        'referer': 'http://ref.com'
      };
      return headers[name];
    });

    const middleware = loggerMiddleware(mockLogger);
    await middleware(c, next);

    expect(mockLogger.logger.child).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'http://localhost/api/test',
        userId: 'user123',
        userAgent: 'Mozilla'
      })
    );
  });

  test('TC-LOG-002: should log HTTP response with status', async () => {
    const middleware = loggerMiddleware(mockLogger);
    await middleware(c, next);

    expect(mockChildLogger.http).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 200,
        responseTime: expect.any(Number)
      })
    );
  });

  test('TC-LOG-003: should call next middleware', async () => {
    const middleware = loggerMiddleware(mockLogger);
    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  test('TC-LOG-004: should handle missing headers gracefully', async () => {
    c.req.header.mockReturnValue(undefined);

    const middleware = loggerMiddleware(mockLogger);
    await middleware(c, next);

    expect(mockLogger.logger.child).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('TC-LOG-005: should calculate response time', async () => {
    const middleware = loggerMiddleware(mockLogger);
    
    next.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    await middleware(c, next);

    const httpCall = mockChildLogger.http.mock.calls[0][0];
    expect(httpCall.responseTime).toBeGreaterThan(0);
  });

  test('TC-LOG-006: should include remoteIP from context', async () => {
    c.get.mockReturnValue('10.0.0.1');

    const middleware = loggerMiddleware(mockLogger);
    await middleware(c, next);

    expect(mockLogger.logger.child).toHaveBeenCalledWith(
      expect.objectContaining({
        remoteIP: '10.0.0.1'
      })
    );
  });

  test('TC-LOG-007: should handle POST requests with payload', async () => {
    c.req.method = 'POST';
    c.req.raw.clone.mockReturnValue({
      json: jest.fn().mockResolvedValue({ data: 'test' })
    });

    const middleware = loggerMiddleware(mockLogger);
    await middleware(c, next);

    expect(mockLogger.logger.child).toHaveBeenCalled();
  });

  test('TC-LOG-008: should handle JSON parse errors', async () => {
    c.req.raw.clone.mockReturnValue({
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    });

    const middleware = loggerMiddleware(mockLogger);
    await middleware(c, next);

    expect(mockLogger.logger.child).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('TC-LOG-009: should log different HTTP methods', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    for (const method of methods) {
      c.req.method = method;
      mockLogger.logger.child.mockClear();

      const middleware = loggerMiddleware(mockLogger);
      await middleware(c, next);

      expect(mockLogger.logger.child).toHaveBeenCalledWith(
        expect.objectContaining({ method })
      );
    }
  });

  test('TC-LOG-010: should handle different response statuses', async () => {
    const statuses = [200, 201, 400, 404, 500];

    for (const status of statuses) {
      c.res.status = status;
      mockChildLogger.http.mockClear();

      const middleware = loggerMiddleware(mockLogger);
      await middleware(c, next);

      expect(mockChildLogger.http).toHaveBeenCalledWith(
        expect.objectContaining({ status })
      );
    }
  });
});
