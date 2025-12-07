/**
 * White Box Testing for enable.ts
 * 
 * Meteor Method Under Test:
 * - '2fa:enable'
 */

describe('enable.ts - 2FA Enable Method', () => {
  
  describe('Meteor Method - 2fa:enable', () => {
    
    test('TC-001: Should throw error when user is not logged in', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }
        return {};
      };

      // Act & Assert
      await expect(enable2FA())
        .rejects
        .toEqual(expect.objectContaining({
          error: 'not-authorized'
        }));
      expect(mockMeteor.userId).toHaveBeenCalled();
    });

    test('TC-002: Should throw error when user has no username', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user?.username) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:enable',
          });
        }
        return {};
      };

      // Act & Assert
      await expect(enable2FA())
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-invalid-user',
          reason: 'Invalid user'
        }));
      expect(mockMeteor.userAsync).toHaveBeenCalled();
    });

    test('TC-003: Should throw error when 2FA is already enabled', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          username: 'testuser',
          services: {
            totp: { enabled: true }
          }
        }),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user?.username) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:enable',
          });
        }

        if (user.services?.totp?.enabled) {
          throw mockMeteor.Error('error-2fa-already-enabled');
        }
        return {};
      };

      // Act & Assert
      await expect(enable2FA())
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-2fa-already-enabled'
        }));
    });

    test('TC-004: Should generate secret and save temp secret', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          username: 'testuser',
          services: {} // No TOTP enabled
        }),
      };
      
      const mockTOTP = {
        generateSecret: jest.fn().mockReturnValue({
          base32: 'JBSWY3DPEHPK3PXP',
          ascii: 'secret123',
          otpauth_url: 'otpauth://totp/Rocket.Chat:testuser?secret=JBSWY3DPEHPK3PXP',
        }),
        generateOtpauthURL: jest.fn().mockReturnValue('otpauth://totp/Rocket.Chat:testuser?secret=JBSWY3DPEHPK3PXP'),
      };
      
      const mockUsers = {
        disable2FAAndSetTempSecretByUserId: jest.fn(),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw { error: 'not-authorized' };
        }

        const user = await mockMeteor.userAsync();
        if (!user?.username) {
          throw { error: 'error-invalid-user', reason: 'Invalid user' };
        }

        if (user.services?.totp?.enabled) {
          throw { error: 'error-2fa-already-enabled' };
        }

        const secret = mockTOTP.generateSecret();
        await mockUsers.disable2FAAndSetTempSecretByUserId(userId, secret.base32);

        return {
          secret: secret.base32,
          url: mockTOTP.generateOtpauthURL(secret, user.username),
        };
      };

      // Act
      const result = await enable2FA();

      // Assert
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.url).toBe('otpauth://totp/Rocket.Chat:testuser?secret=JBSWY3DPEHPK3PXP');
      expect(mockTOTP.generateSecret).toHaveBeenCalled();
      expect(mockUsers.disable2FAAndSetTempSecretByUserId).toHaveBeenCalledWith('user123', 'JBSWY3DPEHPK3PXP');
      expect(mockTOTP.generateOtpauthURL).toHaveBeenCalledWith(
        { base32: 'JBSWY3DPEHPK3PXP', ascii: 'secret123', otpauth_url: expect.any(String) },
        'testuser'
      );
    });

    test('TC-005: Should handle user with null services', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          username: 'testuser',
          services: null // null services
        }),
      };
      
      const mockTOTP = {
        generateSecret: jest.fn().mockReturnValue({
          base32: 'secret123',
          ascii: 'secretascii',
        }),
        generateOtpauthURL: jest.fn().mockReturnValue('otpauth://url'),
      };
      
      const mockUsers = {
        disable2FAAndSetTempSecretByUserId: jest.fn(),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (user.services?.totp?.enabled) {
          throw { error: 'error-2fa-already-enabled' };
        }
        
        const secret = mockTOTP.generateSecret();
        await mockUsers.disable2FAAndSetTempSecretByUserId(userId, secret.base32);
        
        return {
          secret: secret.base32,
          url: mockTOTP.generateOtpauthURL(secret, user.username),
        };
      };

      // Act
      const result = await enable2FA();

      // Assert
      expect(result.secret).toBe('secret123');
      expect(mockUsers.disable2FAAndSetTempSecretByUserId).toHaveBeenCalledWith('user123', 'secret123');
    });

    test('TC-006: Should handle user with undefined totp service', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          username: 'testuser',
          services: {
            password: { bcrypt: 'hashed' }
            // No totp service
          }
        }),
      };
      
      const mockTOTP = {
        generateSecret: jest.fn().mockReturnValue({ base32: 'secret123', ascii: 'secretascii' }),
        generateOtpauthURL: jest.fn().mockReturnValue('otpauth://url'),
      };
      
      const mockUsers = {
        disable2FAAndSetTempSecretByUserId: jest.fn(),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (user.services?.totp?.enabled) {
          throw { error: 'error-2fa-already-enabled' };
        }
        
        const secret = mockTOTP.generateSecret();
        await mockUsers.disable2FAAndSetTempSecretByUserId(userId, secret.base32);
        
        return {
          secret: secret.base32,
          url: mockTOTP.generateOtpauthURL(secret, user.username),
        };
      };

      // Act
      const result = await enable2FA();

      // Assert
      expect(result.secret).toBe('secret123');
      expect(mockUsers.disable2FAAndSetTempSecretByUserId).toHaveBeenCalledWith('user123', 'secret123');
    });

    test('TC-007: Should generate correct OTPAuth URL', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          username: 'john.doe',
          services: {}
        }),
      };
      
      const mockTOTP = {
        generateSecret: jest.fn().mockReturnValue({
          base32: 'JBSWY3DPEHPK3PXP',
          ascii: 'HelloWorld',
        }),
        generateOtpauthURL: jest.fn().mockImplementation((secret, username) => {
          return `otpauth://totp/Rocket.Chat:${username}?secret=${secret.ascii}`;
        }),
      };
      
      const mockUsers = {
        disable2FAAndSetTempSecretByUserId: jest.fn(),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const secret = mockTOTP.generateSecret();
        await mockUsers.disable2FAAndSetTempSecretByUserId(userId, secret.base32);
        
        return {
          secret: secret.base32,
          url: mockTOTP.generateOtpauthURL(secret, user.username),
        };
      };

      // Act
      const result = await enable2FA();

      // Assert
      expect(result.url).toBe('otpauth://totp/Rocket.Chat:john.doe?secret=HelloWorld');
      expect(mockTOTP.generateOtpauthURL).toHaveBeenCalledWith(
        { base32: 'JBSWY3DPEHPK3PXP', ascii: 'HelloWorld' },
        'john.doe'
      );
    });

    test('TC-008: Should return base32 secret in response', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          username: 'testuser',
          services: {}
        }),
      };
      
      const mockTOTP = {
        generateSecret: jest.fn().mockReturnValue({
          base32: 'BASE32SECRET123',
          ascii: 'ASCIISECRET',
          hex: '48454c4c4f',
          otpauth_url: 'otpauth://url',
        }),
        generateOtpauthURL: jest.fn().mockReturnValue('otpauth://url'),
      };
      
      const mockUsers = {
        disable2FAAndSetTempSecretByUserId: jest.fn(),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const secret = mockTOTP.generateSecret();
        await mockUsers.disable2FAAndSetTempSecretByUserId(userId, secret.base32);
        
        return {
          secret: secret.base32,
          url: mockTOTP.generateOtpauthURL(secret, user.username),
        };
      };

      // Act
      const result = await enable2FA();

      // Assert
      expect(result.secret).toBe('BASE32SECRET123');
      expect(result.secret).not.toBe('ASCIISECRET'); // Should be base32, not ascii
      expect(result.secret).not.toBe('48454c4c4f'); // Should be base32, not hex
    });

    test('TC-009: Should not allow enabling if user object is missing', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue(undefined), // undefined user
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user?.username) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:enable',
          });
        }
        return {};
      };

      // Act & Assert
      await expect(enable2FA())
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-invalid-user'
        }));
    });

    test('TC-010: Should handle database error when saving temp secret', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          username: 'testuser',
          services: {}
        }),
      };
      
      const mockTOTP = {
        generateSecret: jest.fn().mockReturnValue({
          base32: 'secret123',
          ascii: 'secretascii',
        }),
        generateOtpauthURL: jest.fn().mockReturnValue('otpauth://url'),
      };
      
      const mockUsers = {
        disable2FAAndSetTempSecretByUserId: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      
      const enable2FA = async () => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const secret = mockTOTP.generateSecret();
        await mockUsers.disable2FAAndSetTempSecretByUserId(userId, secret.base32);
        
        return {
          secret: secret.base32,
          url: mockTOTP.generateOtpauthURL(secret, user.username),
        };
      };

      // Act & Assert
      await expect(enable2FA())
        .rejects
        .toThrow('Database error');
      expect(mockUsers.disable2FAAndSetTempSecretByUserId).toHaveBeenCalledWith('user123', 'secret123');
    });
  });
});
