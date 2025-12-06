/**
 * CORS Middleware - White-Box Testing
 * Tests: cors middleware functionality
 * Total: 15 tests
 */

const { cors } = require('../src/api/middleware/cors');

describe('CORS Middleware - White-Box Testing', () => {
  let c, next, mockSettings;

  beforeEach(() => {
    mockSettings = {
      get: jest.fn()
    };
    c = {
      req: {
        method: 'GET',
        header: jest.fn()
      },
      res: {
        headers: {
          set: jest.fn()
        }
      },
      body: jest.fn()
    };
    next = jest.fn();
  });

  test('TC-CORS-001: should set CORS headers for GET request', async () => {
    c.req.method = 'GET';
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(next).toHaveBeenCalled();
  });

  test('TC-CORS-002: should set CORS headers for POST request', async () => {
    c.req.method = 'POST';
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('TC-CORS-003: should skip pre-flight without proper headers', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockReturnValue(undefined);
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(next).toHaveBeenCalled();
  });

  test('TC-CORS-004: should reject OPTIONS when CORS disabled', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockReturnValue('http://localhost');
    mockSettings.get.mockReturnValue(false);
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.body).toHaveBeenCalledWith(expect.stringContaining('CORS not enabled'), 405);
  });

  test('TC-CORS-005: should allow wildcard origin', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'origin' ? 'http://localhost' : 'GET'
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : '*'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
  });

  test('TC-CORS-006: should allow specific origin', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'origin' ? 'http://localhost' : 'GET'
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : 'http://localhost'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost');
  });

  test('TC-CORS-007: should reject invalid origin', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'origin' ? 'http://evil.com' : 'GET'
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : 'http://localhost'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.body).toHaveBeenCalledWith('Invalid origin', 403);
  });

  test('TC-CORS-008: should handle multiple origins', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'origin' ? 'http://app2.com' : 'GET'
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : 'http://app1.com, http://app2.com'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://app2.com');
  });

  test('TC-CORS-009: should trim whitespace in origins', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'origin' ? 'http://app1.com' : 'GET'
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : '  http://app1.com  '
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://app1.com');
  });

  test('TC-CORS-010: should set all required headers', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockReturnValue('*');
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : '*'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', expect.any(String));
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Headers', expect.any(String));
  });

  test('TC-CORS-011: should check API_Enable_CORS setting', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockReturnValue('http://localhost');
    mockSettings.get.mockReturnValue(false);
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(mockSettings.get).toHaveBeenCalledWith('API_Enable_CORS');
  });

  test('TC-CORS-012: should handle missing origin header', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'access-control-request-method' ? 'GET' : undefined
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : 'http://localhost'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.body).toHaveBeenCalledWith('Invalid origin', 403);
  });

  test('TC-CORS-013: should convert origins to lowercase', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'origin' ? 'http://app1.com' : 'GET'
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : 'http://APP1.COM'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://app1.com');
  });

  test('TC-CORS-014: should set Vary header for specific origins', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockImplementation((name) => 
      name === 'origin' ? 'http://localhost' : 'GET'
    );
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : 'http://localhost'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    expect(c.res.headers.set).toHaveBeenCalledWith('Vary', 'Origin');
  });

  test('TC-CORS-015: should include all HTTP methods', async () => {
    c.req.method = 'OPTIONS';
    c.req.header.mockReturnValue('*');
    mockSettings.get.mockImplementation((key) => 
      key === 'API_Enable_CORS' ? true : '*'
    );
    
    const middleware = cors(mockSettings);
    await middleware(c, next);
    
    const methodsCall = c.res.headers.set.mock.calls.find(call => 
      call[0] === 'Access-Control-Allow-Methods'
    );
    expect(methodsCall[1]).toContain('GET');
    expect(methodsCall[1]).toContain('POST');
    expect(methodsCall[1]).toContain('DELETE');
  });
});
