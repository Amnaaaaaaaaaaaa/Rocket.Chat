const { getRemoteAddress } = require('../src/api/middleware/remoteAddressMiddleware');

describe('remoteAddressMiddleware - White-Box Testing', () => {
  
  beforeEach(() => {
    delete process.env.HTTP_FORWARDED_COUNT;
  });

  test('TC-REMOTE-001: should use x-real-ip header if present', () => {
    const context = {
      req: { header: (name) => name === 'x-real-ip' ? '192.168.1.1' : undefined },
      env: { server: { incoming: { socket: { remoteAddress: '10.0.0.1' } } } }
    };
    
    expect(getRemoteAddress(context)).toBe('192.168.1.1');
  });

  test('TC-REMOTE-002: should use socket.remoteAddress when no headers present', () => {
    const context = {
      req: { header: () => undefined },
      env: { server: { incoming: { socket: { remoteAddress: '10.0.0.1' } } } }
    };
    
    expect(getRemoteAddress(context)).toBe('10.0.0.1');
  });

  test('TC-REMOTE-003: should use connection.remoteAddress as fallback', () => {
    const context = {
      req: { header: () => undefined },
      env: { server: { incoming: { socket: {}, connection: { remoteAddress: '172.16.0.1' } } } }
    };
    
    expect(getRemoteAddress(context)).toBe('172.16.0.1');
  });

  test('TC-REMOTE-004: should handle x-forwarded-for with HTTP_FORWARDED_COUNT', () => {
    process.env.HTTP_FORWARDED_COUNT = '2';
    const context = {
      req: { header: (name) => name === 'x-forwarded-for' ? '192.168.1.1, 10.0.0.1, 172.16.0.1' : undefined },
      env: { server: { incoming: { socket: { remoteAddress: '10.0.0.1' } } } }
    };
    
    expect(getRemoteAddress(context)).toBe('10.0.0.1');
  });

  test('TC-REMOTE-005: should return remoteAddress if HTTP_FORWARDED_COUNT is 0', () => {
    process.env.HTTP_FORWARDED_COUNT = '0';
    const context = {
      req: { header: () => undefined },
      env: { server: { incoming: { socket: { remoteAddress: '10.0.0.1' } } } }
    };
    
    expect(getRemoteAddress(context)).toBe('10.0.0.1');
  });

  test('TC-REMOTE-006: should handle missing socket information', () => {
    const context = {
      req: { header: (name) => name === 'x-forwarded-for' ? '192.168.1.1' : undefined },
      env: { server: { incoming: { socket: {}, connection: {} } } }
    };
    
    expect(getRemoteAddress(context)).toBe('192.168.1.1');
  });

  test('TC-REMOTE-007: should handle count greater than forwarded IPs', () => {
    process.env.HTTP_FORWARDED_COUNT = '5';
    const context = {
      req: { header: (name) => name === 'x-forwarded-for' ? '192.168.1.1, 10.0.0.1' : undefined },
      env: { server: { incoming: { socket: { remoteAddress: '10.0.0.1' } } } }
    };
    
    expect(getRemoteAddress(context)).toBe('10.0.0.1');
  });

  test('TC-REMOTE-008: should handle non-string forwarded-for', () => {
    process.env.HTTP_FORWARDED_COUNT = '1';
    const context = {
      req: { header: (name) => name === 'x-forwarded-for' ? 12345 : undefined },
      env: { server: { incoming: { socket: { remoteAddress: '10.0.0.1' } } } }
    };
    
    const result = getRemoteAddress(context);
    expect(result).toBeDefined();
  });

  test('TC-REMOTE-009: should trim whitespace from forwarded IPs', () => {
    process.env.HTTP_FORWARDED_COUNT = '1';
    const context = {
      req: { header: (name) => name === 'x-forwarded-for' ? ' 192.168.1.1 , 10.0.0.1 ' : undefined },
      env: { server: { incoming: { socket: { remoteAddress: '10.0.0.1' } } } }
    };
    
    expect(getRemoteAddress(context)).toBe('10.0.0.1');
  });

  test('TC-REMOTE-010: should handle undefined env', () => {
    const context = {
      req: { header: (name) => name === 'x-forwarded-for' ? '192.168.1.1' : undefined },
      env: undefined
    };
    
    expect(getRemoteAddress(context)).toBe('192.168.1.1');
  });
});
