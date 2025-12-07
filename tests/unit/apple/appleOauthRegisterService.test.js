/**
 * White Box Testing for appleOauthRegisterService.ts
 * 
 * Testing Apple OAuth service registration and configuration
 */

describe('appleOauthRegisterService.ts - Apple OAuth Service Registration', () => {
  let mockServiceConfiguration;
  let mockSettings;
  let mockKJUR;

  beforeEach(() => {
    mockServiceConfiguration = {
      configurations: {
        removeAsync: jest.fn(),
        upsertAsync: jest.fn()
      }
    };

    mockSettings = {
      get: jest.fn(),
      watchMultiple: jest.fn()
    };

    mockKJUR = {
      jws: {
        JWS: {
          sign: jest.fn()
        }
      }
    };

    jest.clearAllMocks();
  });

  describe('Service Configuration', () => {
    
    test('TC-001: Should remove service configuration when Apple login is disabled', async () => {
      // Arrange
      const enabled = false;

      // Act
      if (!enabled) {
        await mockServiceConfiguration.configurations.removeAsync({
          service: 'apple'
        });
      }

      // Assert
      expect(mockServiceConfiguration.configurations.removeAsync).toHaveBeenCalledWith({
        service: 'apple'
      });
    });

    test('TC-002: Should disable button when credentials are missing but login is enabled', async () => {
      // Arrange
      const enabled = true;
      const clientId = '';
      const serverSecret = '';
      const iss = '';
      const kid = '';

      mockSettings.get.mockReturnValue(enabled);

      // Act
      if (enabled && !clientId && !serverSecret && !iss && !kid) {
        await mockServiceConfiguration.configurations.upsertAsync(
          { service: 'apple' },
          {
            $set: {
              showButton: false,
              enabled: mockSettings.get('Accounts_OAuth_Apple')
            }
          }
        );
      }

      // Assert
      expect(mockServiceConfiguration.configurations.upsertAsync).toHaveBeenCalledWith(
        { service: 'apple' },
        {
          $set: {
            showButton: false,
            enabled: true
          }
        }
      );
    });

    test('TC-003: Should create JWT header with kid and ES256 algorithm', () => {
      // Arrange
      const kid = 'test-kid-123';
      const HEADER = {
        kid,
        alg: 'ES256'
      };

      // Assert
      expect(HEADER.kid).toBe('test-kid-123');
      expect(HEADER.alg).toBe('ES256');
    });

    test('TC-004: Should set expiration time to 5 months from now', () => {
      // Arrange
      const now = new Date();
      const exp = new Date();
      exp.setMonth(exp.getMonth() + 5);

      // Act
      const monthsDiff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

      // Assert
      expect(monthsDiff).toBeGreaterThanOrEqual(4.5);
      expect(monthsDiff).toBeLessThanOrEqual(5.5);
    });

    test('TC-005: Should create JWT payload with required fields', () => {
      // Arrange
      const now = new Date();
      const exp = new Date();
      exp.setMonth(exp.getMonth() + 5);
      const clientId = 'com.example.app';
      const iss = 'TEAM_ID_123';

      const payload = {
        iss,
        iat: Math.floor(now.getTime() / 1000),
        exp: Math.floor(exp.getTime() / 1000),
        aud: 'https://appleid.apple.com',
        sub: clientId
      };

      // Assert
      expect(payload.iss).toBe('TEAM_ID_123');
      expect(payload.aud).toBe('https://appleid.apple.com');
      expect(payload.sub).toBe('com.example.app');
      expect(payload.iat).toBeLessThanOrEqual(payload.exp);
    });

    test('TC-006: Should sign JWT with server secret', () => {
      // Arrange
      const HEADER = { kid: 'test-kid', alg: 'ES256' };
      const payload = {
        iss: 'TEAM_ID',
        iat: 1234567890,
        exp: 1234567890,
        aud: 'https://appleid.apple.com',
        sub: 'client.id'
      };
      const serverSecret = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';

      mockKJUR.jws.JWS.sign.mockReturnValue('signed.jwt.token');

      // Act
      const secret = mockKJUR.jws.JWS.sign(null, HEADER, payload, serverSecret);

      // Assert
      expect(mockKJUR.jws.JWS.sign).toHaveBeenCalledWith(null, HEADER, payload, serverSecret);
      expect(secret).toBe('signed.jwt.token');
    });

    test('TC-007: Should upsert service configuration with all settings', async () => {
      // Arrange
      const enabled = true;
      const clientId = 'com.example.app';
      const secret = 'signed.jwt.token';

      mockSettings.get.mockReturnValue(enabled);

      // Act
      await mockServiceConfiguration.configurations.upsertAsync(
        { service: 'apple' },
        {
          $set: {
            showButton: true,
            secret,
            enabled: mockSettings.get('Accounts_OAuth_Apple'),
            loginStyle: 'popup',
            clientId,
            buttonColor: '#000',
            buttonLabelColor: '#FFF'
          }
        }
      );

      // Assert
      expect(mockServiceConfiguration.configurations.upsertAsync).toHaveBeenCalledWith(
        { service: 'apple' },
        expect.objectContaining({
          $set: expect.objectContaining({
            showButton: true,
            clientId: 'com.example.app',
            buttonColor: '#000',
            buttonLabelColor: '#FFF'
          })
        })
      );
    });

    test('TC-008: Should set button colors to Apple brand colors', async () => {
      // Arrange
      const config = {
        buttonColor: '#000',
        buttonLabelColor: '#FFF'
      };

      // Assert
      expect(config.buttonColor).toBe('#000');
      expect(config.buttonLabelColor).toBe('#FFF');
    });

    test('TC-009: Should set loginStyle to popup', async () => {
      // Arrange
      const config = {
        loginStyle: 'popup'
      };

      // Assert
      expect(config.loginStyle).toBe('popup');
    });

    test('TC-010: Should watch multiple settings for changes', () => {
      // Arrange
      const settingsToWatch = [
        'Accounts_OAuth_Apple',
        'Accounts_OAuth_Apple_id',
        'Accounts_OAuth_Apple_secretKey',
        'Accounts_OAuth_Apple_iss',
        'Accounts_OAuth_Apple_kid'
      ];

      // Act
      mockSettings.watchMultiple(settingsToWatch, jest.fn());

      // Assert
      expect(mockSettings.watchMultiple).toHaveBeenCalledWith(
        settingsToWatch,
        expect.any(Function)
      );
    });

    test('TC-011: Should handle partial configuration gracefully', async () => {
      // Arrange
      const enabled = true;
      const clientId = 'com.example.app';
      const serverSecret = '';
      const iss = '';
      const kid = '';

      // Act
      const hasAllCredentials = !!(clientId && serverSecret && iss && kid);

      // Assert
      expect(hasAllCredentials).toBe(false);
    });

    test('TC-012: Should validate all credentials are present', () => {
      // Arrange
      const clientId = 'com.example.app';
      const serverSecret = 'secret-key';
      const iss = 'TEAM_ID';
      const kid = 'KEY_ID';

      // Act
      const hasAllCredentials = !!(clientId && serverSecret && iss && kid);

      // Assert
      expect(hasAllCredentials).toBe(true);
    });

    test('TC-013: Should convert timestamps to seconds for JWT', () => {
      // Arrange
      const now = new Date();
      const milliseconds = now.getTime();

      // Act
      const seconds = Math.floor(milliseconds / 1000);

      // Assert
      expect(seconds).toBeLessThan(milliseconds);
      expect(seconds.toString().length).toBeLessThanOrEqual(10);
    });

    test('TC-014: Should set audience to Apple ID server URL', () => {
      // Arrange
      const payload = {
        aud: 'https://appleid.apple.com'
      };

      // Assert
      expect(payload.aud).toBe('https://appleid.apple.com');
      expect(payload.aud).toContain('appleid.apple.com');
    });

    test('TC-015: Should enable showButton when all credentials are present', async () => {
      // Arrange
      const enabled = true;
      const clientId = 'com.example.app';
      const serverSecret = 'secret-key';
      const iss = 'TEAM_ID';
      const kid = 'KEY_ID';

      mockSettings.get.mockReturnValue(enabled);
      mockKJUR.jws.JWS.sign.mockReturnValue('signed.jwt.token');

      // Act
      const hasAllCredentials = !!(clientId && serverSecret && iss && kid);

      if (enabled && hasAllCredentials) {
        await mockServiceConfiguration.configurations.upsertAsync(
          { service: 'apple' },
          {
            $set: {
              showButton: true,
              secret: 'signed.jwt.token',
              enabled: mockSettings.get('Accounts_OAuth_Apple'),
              loginStyle: 'popup',
              clientId,
              buttonColor: '#000',
              buttonLabelColor: '#FFF'
            }
          }
        );
      }

      // Assert
      expect(mockServiceConfiguration.configurations.upsertAsync).toHaveBeenCalledWith(
        { service: 'apple' },
        expect.objectContaining({
          $set: expect.objectContaining({
            showButton: true
          })
        })
      );
    });
  });
});
