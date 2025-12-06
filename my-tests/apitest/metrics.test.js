/**
 * Metrics Middleware - White-Box Testing
 * Tests: metricsMiddleware functionality
 * Total: 10 tests
 */

const { metricsMiddleware } = require('../src/api/middleware/metrics');

describe('Metrics Middleware - White-Box Testing', () => {
  let c, next, mockSettings, mockSummary, mockEndTimer;

  beforeEach(() => {
    mockEndTimer = jest.fn();
    mockSummary = {
      startTimer: jest.fn().mockReturnValue(mockEndTimer)
    };
    mockSettings = {
      get: jest.fn()
    };
    c = {
      req: {
        method: 'GET',
        path: '/api/v1/test',
        routePath: '/api/v1/test',
        header: jest.fn()
      },
      res: {
        status: 200
      }
    };
    next = jest.fn();
  });

  test('TC-MET-001: should start timer on request', async () => {
    const middleware = metricsMiddleware({
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    expect(mockSummary.startTimer).toHaveBeenCalled();
  });

  test('TC-MET-002: should end timer with metrics', async () => {
    const middleware = metricsMiddleware({
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    expect(mockEndTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 200,
        method: 'get',
        version: 1,
        entrypoint: '/api/v1/test'
      })
    );
  });

  test('TC-MET-003: should strip base path from entrypoint', async () => {
    const middleware = metricsMiddleware({
      basePathRegex: /^\/api\/v1\//,
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    expect(mockEndTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        entrypoint: 'test'
      })
    );
  });

  test('TC-MET-004: should include user agent when enabled', async () => {
    mockSettings.get.mockReturnValue(true);
    c.req.header.mockReturnValue('Mozilla/5.0');

    const middleware = metricsMiddleware({
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    expect(mockEndTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        user_agent: 'Mozilla/5.0'
      })
    );
  });

  test('TC-MET-005: should not include user agent when disabled', async () => {
    mockSettings.get.mockReturnValue(false);

    const middleware = metricsMiddleware({
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    const callArgs = mockEndTimer.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty('user_agent');
  });

  test('TC-MET-006: should decode method.call endpoints', async () => {
    c.req.routePath = '/api/v1/method.call/:id';
    c.req.path = '/api/v1/method.call/get%3Aparam';

    const middleware = metricsMiddleware({
      basePathRegex: /^\/api\/v1\//,
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    expect(mockEndTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        entrypoint: 'method.call/get:param'
      })
    );
  });

  test('TC-MET-007: should convert method to lowercase', async () => {
    c.req.method = 'POST';

    const middleware = metricsMiddleware({
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    expect(mockEndTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post'
      })
    );
  });

  test('TC-MET-008: should call next middleware', async () => {
    const middleware = metricsMiddleware({
      api: { version: 1 },
      settings: mockSettings,
      summary: mockSummary
    });

    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  test('TC-MET-009: should handle different API versions', async () => {
    const versions = [1, 2, 3];

    for (const version of versions) {
      mockEndTimer.mockClear();

      const middleware = metricsMiddleware({
        api: { version },
        settings: mockSettings,
        summary: mockSummary
      });

      await middleware(c, next);

      expect(mockEndTimer).toHaveBeenCalledWith(
        expect.objectContaining({ version })
      );
    }
  });

  test('TC-MET-010: should handle different response statuses', async () => {
    const statuses = [200, 201, 400, 404, 500];

    for (const status of statuses) {
      c.res.status = status;
      mockEndTimer.mockClear();

      const middleware = metricsMiddleware({
        api: { version: 1 },
        settings: mockSettings,
        summary: mockSummary
      });

      await middleware(c, next);

      expect(mockEndTimer).toHaveBeenCalledWith(
        expect.objectContaining({ status })
      );
    }
  });
});
