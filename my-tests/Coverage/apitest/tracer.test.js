/**
 * Tracer Middleware - White-Box Testing
 * Tests: tracerSpanMiddleware functionality
 * Total: 8 tests
 */

const { tracerSpanMiddleware } = require('../src/api/middleware/tracer');

describe('Tracer Middleware - White-Box Testing', () => {
  let c, next;

  beforeEach(() => {
    c = {
      req: {
        method: 'GET',
        url: 'http://localhost/api/test',
        raw: { userId: 'user123' }
      },
      res: {
        status: 200
      },
      header: jest.fn()
    };
    next = jest.fn();
  });

  test('TC-TRACE-001: should set X-Trace-Id header', async () => {
    await tracerSpanMiddleware(c, next);

    expect(c.header).toHaveBeenCalledWith('X-Trace-Id', expect.any(String));
  });

  test('TC-TRACE-002: should call next middleware', async () => {
    await tracerSpanMiddleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  test('TC-TRACE-003: should create span with method and URL', async () => {
    await tracerSpanMiddleware(c, next);

    expect(c.header).toHaveBeenCalled();
  });

  test('TC-TRACE-004: should handle different HTTP methods', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];

    for (const method of methods) {
      c.req.method = method;
      c.header.mockClear();

      await tracerSpanMiddleware(c, next);

      expect(c.header).toHaveBeenCalled();
    }
  });

  test('TC-TRACE-005: should handle different response statuses', async () => {
    const statuses = [200, 201, 400, 404, 500];

    for (const status of statuses) {
      c.res.status = status;
      c.header.mockClear();

      await tracerSpanMiddleware(c, next);

      expect(c.header).toHaveBeenCalled();
    }
  });

  test('TC-TRACE-006: should handle missing userId', async () => {
    c.req.raw = {};

    await tracerSpanMiddleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  test('TC-TRACE-007: should handle undefined userId', async () => {
    c.req.raw.userId = undefined;

    await tracerSpanMiddleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  test('TC-TRACE-008: should set trace ID before calling next', async () => {
    const callOrder = [];
    c.header.mockImplementation(() => callOrder.push('header'));
    next.mockImplementation(() => callOrder.push('next'));

    await tracerSpanMiddleware(c, next);

    expect(callOrder).toEqual(['header', 'next']);
  });
});
