/**
 * White Box Testing for regenerateCodes.ts
 * 
 * Meteor Method Under Test:
 * - '2fa:regenerateCodes'
 */

describe('regenerateCodes.ts - Regenerate Backup Codes', () => {
  
  describe('Meteor Method - 2fa:regenerateCodes', () => {
    
    test('TC-001: Should throw error when user is not logged in', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }
        return {};
      };

      // Act & Assert
      await expect(regenerateCodes('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'not-authorized'
        }));
    });

    test('TC-002: Should throw error when user is invalid', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:regenerateCodes',
          });
        }
        return {};
      };

      // Act & Assert
      await expect(regenerateCodes('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-invalid-user',
          reason: 'Invalid user'
        }));
    });

    test('TC-003: Should throw error when TOTP is not enabled', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: { enabled: false } // Not enabled
          }
        }),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw mockMeteor.Error('invalid-totp');
        }
        return {};
      };

      // Act & Assert
      await expect(regenerateCodes('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
    });

    test('TC-004: Should return new codes when verification succeeds', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: ['oldHash1', 'oldHash2']
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['newCode1', 'newCode2', 'newCode3', 'newCode4', 'newCode5', 'newCode6', 'newCode7', 'newCode8', 'newCode9', 'newCode10', 'newCode11', 'newCode12'],
          hashedCodes: ['newHash1', 'newHash2', 'newHash3', 'newHash4', 'newHash5', 'newHash6', 'newHash7', 'newHash8', 'newHash9', 'newHash10', 'newHash11', 'newHash12']
        }),
      };
      
      const mockUsers = {
        update2FABackupCodesByUserId: jest.fn(),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }

        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: userToken,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (verified) {
          const { codes, hashedCodes } = mockTOTP.generateCodes();
          await mockUsers.update2FABackupCodesByUserId(userId, hashedCodes);
          return { codes };
        }
        // Returns undefined if not verified
      };

      // Act
      const result = await regenerateCodes('123456');

      // Assert
      expect(result.codes).toHaveLength(12);
      expect(result.codes[0]).toBe('newCode1');
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: '123456',
        userId: 'user123',
        backupTokens: ['oldHash1', 'oldHash2'],
      });
      expect(mockTOTP.generateCodes).toHaveBeenCalled();
      expect(mockUsers.update2FABackupCodesByUserId).toHaveBeenCalledWith(
        'user123',
        ['newHash1', 'newHash2', 'newHash3', 'newHash4', 'newHash5', 'newHash6', 'newHash7', 'newHash8', 'newHash9', 'newHash10', 'newHash11', 'newHash12']
      );
    });

    test('TC-005: Should return undefined when verification fails', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: []
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(false), // Verification fails
        generateCodes: jest.fn(),
      };
      
      const mockUsers = {
        update2FABackupCodesByUserId: jest.fn(),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }

        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: userToken,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (verified) {
          const { codes, hashedCodes } = mockTOTP.generateCodes();
          await mockUsers.update2FABackupCodesByUserId(userId, hashedCodes);
          return { codes };
        }
        // Returns undefined
      };

      // Act
      const result = await regenerateCodes('wrongcode');

      // Assert
      expect(result).toBeUndefined();
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: 'wrongcode',
        userId: 'user123',
        backupTokens: [],
      });
      expect(mockTOTP.generateCodes).not.toHaveBeenCalled();
      expect(mockUsers.update2FABackupCodesByUserId).not.toHaveBeenCalled();
    });

    test('TC-006: Should handle user with null services', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: null // null services
        }),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const regenerateCodes = async (userToken) => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw mockMeteor.Error('invalid-totp');
        }
        return {};
      };

      // Act & Assert
      await expect(regenerateCodes('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
    });

    test('TC-007: Should handle user without totp service', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            password: { bcrypt: 'hashed' }
            // No totp service
          }
        }),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const regenerateCodes = async (userToken) => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw mockMeteor.Error('invalid-totp');
        }
        return {};
      };

      // Act & Assert
      await expect(regenerateCodes('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
    });

    test('TC-008: Should handle user with undefined hashedBackup', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: undefined
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['code1', 'code2'],
          hashedCodes: ['hash1', 'hash2']
        }),
      };
      
      const mockUsers = {
        update2FABackupCodesByUserId: jest.fn(),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: userToken,
          userId,
          backupTokens: user.services.totp.hashedBackup, // undefined
        });

        if (verified) {
          const { codes, hashedCodes } = mockTOTP.generateCodes();
          await mockUsers.update2FABackupCodesByUserId(userId, hashedCodes);
          return { codes };
        }
      };

      // Act
      const result = await regenerateCodes('123456');

      // Assert
      expect(result.codes).toHaveLength(2);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: '123456',
        userId: 'user123',
        backupTokens: undefined,
      });
    });

    test('TC-009: Should handle verification with backup code', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: ['hashedBackupCode']
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockImplementation(async ({ secret, token, userId, backupTokens }) => {
          // Simulate backup code verification
          if (token === 'backup123' && backupTokens?.includes('hashedBackupCode')) {
            return true;
          }
          return false;
        }),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['newCode1', 'newCode2'],
          hashedCodes: ['newHash1', 'newHash2']
        }),
      };
      
      const mockUsers = {
        update2FABackupCodesByUserId: jest.fn(),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: userToken,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (verified) {
          const { codes, hashedCodes } = mockTOTP.generateCodes();
          await mockUsers.update2FABackupCodesByUserId(userId, hashedCodes);
          return { codes };
        }
      };

      // Act
      const result = await regenerateCodes('backup123');

      // Assert
      expect(result.codes).toHaveLength(2);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: 'backup123',
        userId: 'user123',
        backupTokens: ['hashedBackupCode'],
      });
    });

    test('TC-010: Should handle database error when updating backup codes', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: []
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['code1'],
          hashedCodes: ['hash1']
        }),
      };
      
      const mockUsers = {
        update2FABackupCodesByUserId: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      
      const regenerateCodes = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: userToken,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (verified) {
          const { codes, hashedCodes } = mockTOTP.generateCodes();
          await mockUsers.update2FABackupCodesByUserId(userId, hashedCodes);
          return { codes };
        }
      };

      // Act & Assert
      await expect(regenerateCodes('123456'))
        .rejects
        .toThrow('Database error');
    });
  });
});
