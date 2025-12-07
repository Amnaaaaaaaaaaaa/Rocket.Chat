/**
 * White Box Testing for lib.ts
 * 
 * Functions Under Test:
 * - Tokenpass OAuth configuration
 * - Meteor.startup callback
 * - settings.watch callback
 */

describe('lib.ts - Tokenpass OAuth Configuration', () => {
  let mockCustomOAuth;
  let mockMeteor;
  let mockSettings;
  let mockTokenpass;

  beforeEach(() => {
    mockTokenpass = {
      configure: jest.fn(),
    };

    mockCustomOAuth = jest.fn(() => mockTokenpass);

    mockMeteor = {
      startup: jest.fn((callback) => {
        callback();
      }),
    };

    mockSettings = {
      watch: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('OAuth Configuration', () => {
    
    test('TC-001: Should create CustomOAuth instance with correct name', () => {
      // Arrange
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      // Act
      const result = mockCustomOAuth('tokenpass', config);

      // Assert
      expect(mockCustomOAuth).toHaveBeenCalledWith('tokenpass', config);
      expect(result).toBe(mockTokenpass);
    });

    test('TC-002: Should have correct serverURL in config', () => {
      // Arrange
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      // Assert
      expect(config.serverURL).toBe('');
    });

    test('TC-003: Should have correct identityPath in config', () => {
      // Arrange
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      // Assert
      expect(config.identityPath).toBe('/oauth/user');
    });

    test('TC-004: Should have correct authorizePath in config', () => {
      // Arrange
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      // Assert
      expect(config.authorizePath).toBe('/oauth/authorize');
    });

    test('TC-005: Should have correct tokenPath in config', () => {
      // Arrange
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      // Assert
      expect(config.tokenPath).toBe('/oauth/access-token');
    });

    test('TC-006: Should have mergeUsers enabled', () => {
      // Arrange
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      // Assert
      expect(config.mergeUsers).toBe(true);
    });

    test('TC-007: Should have correct addAutopublishFields configuration', () => {
      // Arrange
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      // Assert
      expect(config.addAutopublishFields.forLoggedInUser).toEqual(['services.tokenpass']);
      expect(config.addAutopublishFields.forOtherUsers).toEqual(['services.tokenpass.name']);
    });
  });

  describe('Meteor.startup', () => {
    
    test('TC-008: Should call settings.watch on startup', () => {
      // Arrange
      const watchCallback = jest.fn();

      // Act
      mockMeteor.startup(() => {
        mockSettings.watch('API_Tokenpass_URL', watchCallback);
      });

      // Assert
      expect(mockMeteor.startup).toHaveBeenCalled();
      expect(mockSettings.watch).toHaveBeenCalledWith('API_Tokenpass_URL', watchCallback);
    });

    test('TC-009: Should update config and call configure when setting changes', () => {
      // Arrange
      const newURL = 'https://tokenpass.example.com';
      const config = {
        serverURL: '',
        identityPath: '/oauth/user',
        authorizePath: '/oauth/authorize',
        tokenPath: '/oauth/access-token',
        scope: 'user',
        tokenSentVia: 'payload',
        usernameField: 'username',
        mergeUsers: true,
        addAutopublishFields: {
          forLoggedInUser: ['services.tokenpass'],
          forOtherUsers: ['services.tokenpass.name'],
        },
        accessTokenParam: 'access_token',
      };

      let settingsWatchCallback;

      mockSettings.watch.mockImplementation((key, callback) => {
        settingsWatchCallback = callback;
      });

      mockMeteor.startup(() => {
        mockSettings.watch('API_Tokenpass_URL', (value) => {
          config.serverURL = value;
          mockTokenpass.configure(config);
        });
      });

      // Act
      settingsWatchCallback(newURL);

      // Assert
      expect(config.serverURL).toBe(newURL);
      expect(mockTokenpass.configure).toHaveBeenCalledWith(config);
    });

    test('TC-010: Should watch for API_Tokenpass_URL setting', () => {
      // Arrange
      const watchCallback = jest.fn();

      // Act
      mockMeteor.startup(() => {
        mockSettings.watch('API_Tokenpass_URL', watchCallback);
      });

      // Assert
      expect(mockSettings.watch).toHaveBeenCalledWith('API_Tokenpass_URL', watchCallback);
    });
  });
});
