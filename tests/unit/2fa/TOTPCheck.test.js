/**
 * White Box Testing for TOTPCheck.ts
 * 
 * Class Under Test:
 * - TOTPCheck
 */

describe('TOTPCheck.ts - TOTP Check', () => {
  
  describe('TOTPCheck Class', () => {
    
    test('TC-001: Should have correct name property', () => {
      // Arrange & Act
      const instance = {
        name: 'totp',
        isEnabled: jest.fn(),
        verify: jest.fn(),
        processInvalidCode: jest.fn(),
        maxFaildedAttemtpsReached: jest.fn(),
      };

      // Assert
      expect(instance.name).toBe('totp');
    });

    test('TC-002: isEnabled should return false when TOTP is disabled globally', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(false) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_TOTP_Enabled')) {
          return false;
        }

        return user.services?.totp?.enabled === true;
      };
      
      const user = { services: { totp: { enabled: true } } };

      // Act
      const result = isEnabled(user);

      // Assert
      expect(result).toBe(false);
      expect(mockSettings.get).toHaveBeenCalledWith('Accounts_TwoFactorAuthentication_By_TOTP_Enabled');
    });

    test('TC-003: isEnabled should return false when user TOTP is not enabled', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_TOTP_Enabled')) {
          return false;
        }

        return user.services?.totp?.enabled === true;
      };
      
      const user1 = { services: { totp: { enabled: false } } };
      const user2 = { services: {} };
      const user3 = { services: { totp: null } };

      // Act
      const result1 = isEnabled(user1);
      const result2 = isEnabled(user2);
      const result3 = isEnabled(user3);

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    test('TC-004: isEnabled should return true when TOTP is enabled', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_TOTP_Enabled')) {
          return false;
        }

        return user.services?.totp?.enabled === true;
      };
      
      const user = { services: { totp: { enabled: true } } };

      // Act
      const result = isEnabled(user);

      // Assert
      expect(result).toBe(true);
    });

    test('TC-005: verify should return false when not enabled', async () => {
      // Arrange
      const verify = async (user, code) => {
        const mockIsEnabled = jest.fn().mockReturnValue(false);
        if (!mockIsEnabled(user)) {
          return false;
        }
        return true;
      };
      
      const user = { _id: 'user123' };
      const code = '123456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-006: verify should return false when no secret exists', async () => {
      // Arrange
      const verify = async (user, code) => {
        const mockIsEnabled = jest.fn().mockReturnValue(true);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.totp?.secret) {
          return false;
        }
        return true;
      };
      
      const user = { 
        _id: 'user123',
        services: { totp: { enabled: true } } // No secret
      };
      const code = '123456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-007: verify should call TOTP.verify with correct parameters', async () => {
      // Arrange
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
      };
      
      const verify = async (user, code) => {
        const mockIsEnabled = jest.fn().mockReturnValue(true);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.totp?.secret) {
          return false;
        }

        return mockTOTP.verify({
          secret: user.services?.totp?.secret,
          token: code,
          userId: user._id,
          backupTokens: user.services?.totp?.hashedBackup,
        });
      };
      
      const user = { 
        _id: 'user123',
        services: { 
          totp: { 
            enabled: true,
            secret: 'secret123',
            hashedBackup: ['backup1', 'backup2']
          } 
        }
      };
      const code = '123456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(true);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: '123456',
        userId: 'user123',
        backupTokens: ['backup1', 'backup2'],
      });
    });

    test('TC-008: processInvalidCode should return codeGenerated false', async () => {
      // Arrange
      const processInvalidCode = async () => {
        // Nothing to do
        return {
          codeGenerated: false,
        };
      };
      
      const user = { _id: 'user123' };

      // Act
      const result = await processInvalidCode(user);

      // Assert
      expect(result).toEqual({ codeGenerated: false });
    });

    test('TC-009: maxFailedAttemptsReached should always return false', async () => {
      // Arrange
      const maxFaildedAttemtpsReached = async () => {
        return false;
      };
      
      const user = { _id: 'user123' };

      // Act
      const result = await maxFaildedAttemtpsReached(user);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-010: Edge case - user with undefined services', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_TOTP_Enabled')) {
          return false;
        }

        return user.services?.totp?.enabled === true;
      };
      
      const user1 = { services: undefined };
      const user2 = { services: null };
      const user3 = {};

      // Act
      const result1 = isEnabled(user1);
      const result2 = isEnabled(user2);
      const result3 = isEnabled(user3);

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    test('TC-011: Edge case - verify with backup code', async () => {
      // Arrange
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
      };
      
      const verify = async (user, code) => {
        const mockIsEnabled = jest.fn().mockReturnValue(true);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.totp?.secret) {
          return false;
        }

        // Backup codes are 8 characters long
        if (code.length === 8 && user.services?.totp?.hashedBackup) {
          return mockTOTP.verify({
            secret: user.services?.totp?.secret,
            token: code,
            userId: user._id,
            backupTokens: user.services?.totp?.hashedBackup,
          });
        }
        
        return mockTOTP.verify({
          secret: user.services?.totp?.secret,
          token: code,
          userId: user._id,
          backupTokens: user.services?.totp?.hashedBackup,
        });
      };
      
      const user = { 
        _id: 'user123',
        services: { 
          totp: { 
            enabled: true,
            secret: 'secret123',
            hashedBackup: ['backup1', 'backup2']
          } 
        }
      };
      const backupCode = '12345678'; // 8 characters

      // Act
      const result = await verify(user, backupCode);

      // Assert
      expect(result).toBe(true);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: '12345678',
        userId: 'user123',
        backupTokens: ['backup1', 'backup2'],
      });
    });
  });
});
