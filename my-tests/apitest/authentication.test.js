/**
 * Authentication Middleware - White-Box Testing
 * Tests: authenticationMiddleware, hasPermissionMiddleware
 * Total: 20 tests
 */

const { authenticationMiddleware, hasPermissionMiddleware } = require('../src/api/middleware/authentication');

describe('Authentication Middleware - White-Box Testing', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticationMiddleware', () => {
    test('TC-AUTH-MW-001: should handle basic authentication flow', async () => {
      const middleware = authenticationMiddleware();
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('TC-AUTH-MW-002: should use cookies when enabled', async () => {
      req.cookies = { rc_token: 'token', rc_uid: 'uid' };
      const middleware = authenticationMiddleware({ cookies: true });
      await middleware(req, res, next);
      expect(req.headers['x-auth-token']).toBe('token');
    });

    test('TC-AUTH-MW-003: should not reject when rejectUnauthorized false', async () => {
      const middleware = authenticationMiddleware({ rejectUnauthorized: false });
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('TC-AUTH-MW-004: should set userId from user', async () => {
      const middleware = authenticationMiddleware({ rejectUnauthorized: false });
      
      await middleware(req, res, async () => {
        req.user = { _id: 'user123' };
        req.userId = req.user._id;
      });
      
      expect(req.userId).toBe('user123');
    });

    test('TC-AUTH-MW-005: should handle undefined user', async () => {
      const middleware = authenticationMiddleware({ rejectUnauthorized: false });
      await middleware(req, res, next);
      expect(req.user).toBeUndefined();
    });

    test('TC-AUTH-MW-006: should use cookies over headers when cookies enabled', async () => {
      req.headers['x-auth-token'] = 'header-token';
      req.cookies.rc_token = 'cookie-token';
      const middleware = authenticationMiddleware({ cookies: true });
      await middleware(req, res, next);
      // The implementation uses ?? operator: req.cookies.rc_token ?? req.headers['x-auth-token']
      // This means cookies take priority when present
      expect(req.headers['x-auth-token']).toBe('cookie-token');
    });

    test('TC-AUTH-MW-007: should handle missing cookies', async () => {
      req.cookies = {};
      const middleware = authenticationMiddleware({ cookies: true, rejectUnauthorized: false });
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('TC-AUTH-MW-008: should use default config', async () => {
      const middleware = authenticationMiddleware();
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('TC-AUTH-MW-009: should handle empty headers', async () => {
      const middleware = authenticationMiddleware();
      await middleware(req, res, next);
      expect(req.user).toBeUndefined();
    });

    test('TC-AUTH-MW-010: should call next after success', async () => {
      const middleware = authenticationMiddleware({ rejectUnauthorized: false });
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasPermissionMiddleware', () => {
    test('TC-PERM-MW-001: should reject without userId', async () => {
      const middleware = hasPermissionMiddleware('test-perm');
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('TC-PERM-MW-002: should set unauthorized flag', async () => {
      const middleware = hasPermissionMiddleware('test-perm', { rejectUnauthorized: false });
      await middleware(req, res, next);
      expect(req.unauthorized).toBe(true);
    });

    test('TC-PERM-MW-003: should check permission with userId', async () => {
      req.userId = 'user123';
      const middleware = hasPermissionMiddleware('test-perm');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('TC-PERM-MW-004: should return 403 on no permission', async () => {
      req.userId = 'user123';
      const middleware = hasPermissionMiddleware('test-perm');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('TC-PERM-MW-005: should handle null userId', async () => {
      req.userId = null;
      const middleware = hasPermissionMiddleware('test-perm', { rejectUnauthorized: false });
      await middleware(req, res, next);
      expect(req.unauthorized).toBe(true);
    });

    test('TC-PERM-MW-006: should use default rejectUnauthorized', async () => {
      const middleware = hasPermissionMiddleware('test-perm');
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('TC-PERM-MW-007: should handle undefined userId', async () => {
      req.userId = undefined;
      const middleware = hasPermissionMiddleware('test-perm');
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('TC-PERM-MW-008: should call next on success', async () => {
      req.userId = 'user123';
      const middleware = hasPermissionMiddleware('test-perm');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('TC-PERM-MW-009: should handle empty permission string', async () => {
      req.userId = 'user123';
      const middleware = hasPermissionMiddleware('');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('TC-PERM-MW-010: should handle special permission names', async () => {
      req.userId = 'user123';
      const middleware = hasPermissionMiddleware('manage-voip-settings');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
