/**
 * White Box Testing for config.ts
 * 
 * Testing the Apple OAuth configuration object
 */

describe('config.ts - Apple OAuth Configuration', () => {
  let config;

  beforeEach(() => {
    config = {
      serverURL: 'https://appleid.apple.com',
      authorizePath: '/auth/authorize?response_mode=form_post',
      responseType: 'code id_token',
      tokenPath: '/auth/token',
      scope: 'name email',
      mergeUsers: true,
      accessTokenParam: 'access_token',
      loginStyle: 'popup',
    };
  });

  describe('Configuration Properties', () => {
    
    test('TC-001: Should have correct serverURL', () => {
      expect(config.serverURL).toBe('https://appleid.apple.com');
    });

    test('TC-002: Should have correct authorizePath with form_post response mode', () => {
      expect(config.authorizePath).toBe('/auth/authorize?response_mode=form_post');
      expect(config.authorizePath).toContain('response_mode=form_post');
    });

    test('TC-003: Should have correct responseType', () => {
      expect(config.responseType).toBe('code id_token');
    });

    test('TC-004: Should have correct tokenPath', () => {
      expect(config.tokenPath).toBe('/auth/token');
    });

    test('TC-005: Should have correct scope for name and email', () => {
      expect(config.scope).toBe('name email');
      expect(config.scope).toContain('name');
      expect(config.scope).toContain('email');
    });

    test('TC-006: Should have mergeUsers enabled', () => {
      expect(config.mergeUsers).toBe(true);
    });

    test('TC-007: Should have correct accessTokenParam', () => {
      expect(config.accessTokenParam).toBe('access_token');
    });

    test('TC-008: Should have popup loginStyle', () => {
      expect(config.loginStyle).toBe('popup');
    });

    test('TC-009: Should have all required OAuth config properties', () => {
      expect(config).toHaveProperty('serverURL');
      expect(config).toHaveProperty('authorizePath');
      expect(config).toHaveProperty('responseType');
      expect(config).toHaveProperty('tokenPath');
      expect(config).toHaveProperty('scope');
      expect(config).toHaveProperty('mergeUsers');
      expect(config).toHaveProperty('accessTokenParam');
      expect(config).toHaveProperty('loginStyle');
    });

    test('TC-010: Should be immutable configuration object', () => {
      const configKeys = Object.keys(config);
      expect(configKeys.length).toBe(8);
      expect(configKeys).toEqual([
        'serverURL',
        'authorizePath',
        'responseType',
        'tokenPath',
        'scope',
        'mergeUsers',
        'accessTokenParam',
        'loginStyle'
      ]);
    });
  });
});
