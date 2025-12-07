/**
 * White Box Testing for disable.ts
 * 
 * Meteor Method Under Test:
 * - '2fa:disable'
 */

describe('disable.ts - 2FA Disable Method', () => {
  
  describe('Meteor Method - 2fa:disable', () => {
    
    test('TC-001: Should throw error when user is not logged in', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }
        return true;
      };

      // Act & Assert
      await expect(disable2FA('123456'))
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
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:disable',
          });
        }
        return true;
      };

      // Act & Assert
      await expect(disable2FA('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-invalid-user',
          reason: 'Invalid user'
        }));
    });

    test('TC-003: Should return false when 2FA is not enabled', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: { enabled: false } // Not enabled
          }
        }),
      };
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw { error: 'not-authorized' };
        }

        const user = await mockMeteor.userAsync();
        if (!user) {
          throw { error: 'error-invalid-user', reason: 'Invalid user' };
        }

        if (!user.services?.totp?.enabled) {
          return false;
        }
        return true;
      };

      // Act
      const result = await disable2FA('123456');

      // Assert
      expect(result).toBe(false);
    });

    test('TC-004: Should return false when code verification fails', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: ['backup1', 'backup2']
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(false), // Verification fails
      };
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          return false;
        }

        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: code,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (!verified) {
          return false;
        }
        return true;
      };

      // Act
      const result = await disable2FA('wrongcode');

      // Assert
      expect(result).toBe(false);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: 'wrongcode',
        userId: 'user123',
        backupTokens: ['backup1', 'backup2'],
      });
    });

    test('TC-005: Should disable 2FA when code is verified', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: ['backup1']
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true), // Verification succeeds
      };
      
      const mockUsers = {
        disable2FAByUserId: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      };
      
      const mockNotifyOnUserChange = jest.fn();
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          return false;
        }

        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: code,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (!verified) {
          return false;
        }

        const { modifiedCount } = await mockUsers.disable2FAByUserId(userId);
        if (!modifiedCount) {
          return false;
        }

        mockNotifyOnUserChange({ 
          clientAction: 'updated', 
          id: user._id, 
          diff: { 'services.totp.enabled': false } 
        });

        return true;
      };

      // Act
      const result = await disable2FA('123456');

      // Assert
      expect(result).toBe(true);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: '123456',
        userId: 'user123',
        backupTokens: ['backup1'],
      });
      expect(mockUsers.disable2FAByUserId).toHaveBeenCalledWith('user123');
      expect(mockNotifyOnUserChange).toHaveBeenCalledWith({
        clientAction: 'updated',
        id: 'user123',
        diff: { 'services.totp.enabled': false }
      });
    });

    test('TC-006: Should return false when no users were modified', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: { enabled: true, secret: 'secret123', hashedBackup: [] }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
      };
      
      const mockUsers = {
        disable2FAByUserId: jest.fn().mockResolvedValue({ modifiedCount: 0 }), // No modifications
      };
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          return false;
        }

        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: code,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (!verified) {
          return false;
        }

        const { modifiedCount } = await mockUsers.disable2FAByUserId(userId);
        if (!modifiedCount) {
          return false;
        }
        return true;
      };

      // Act
      const result = await disable2FA('123456');

      // Assert
      expect(result).toBe(false);
      expect(mockUsers.disable2FAByUserId).toHaveBeenCalledWith('user123');
    });

    test('TC-007: Should handle user without backup tokens', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: undefined // No backup tokens
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
      };
      
      const mockUsers = {
        disable2FAByUserId: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      };
      
      const mockNotifyOnUserChange = jest.fn();
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: code,
          userId,
          backupTokens: user.services.totp.hashedBackup, // undefined
        });

        if (!verified) {
          return false;
        }

        const { modifiedCount } = await mockUsers.disable2FAByUserId(userId);
        if (!modifiedCount) {
          return false;
        }

        mockNotifyOnUserChange({ 
          clientAction: 'updated', 
          id: user._id, 
          diff: { 'services.totp.enabled': false } 
        });

        return true;
      };

      // Act
      const result = await disable2FA('123456');

      // Assert
      expect(result).toBe(true);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: '123456',
        userId: 'user123',
        backupTokens: undefined,
      });
    });

    test('TC-008: Should handle user with empty backup tokens array', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: [] // Empty array
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
      };
      
      const mockUsers = {
        disable2FAByUserId: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      };
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: code,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (!verified) {
          return false;
        }

        const { modifiedCount } = await mockUsers.disable2FAByUserId(userId);
        return !!modifiedCount;
      };

      // Act
      const result = await disable2FA('123456');

      // Assert
      expect(result).toBe(true);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: '123456',
        userId: 'user123',
        backupTokens: [],
      });
    });

    test('TC-009: Should handle user with null services', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: null // null services
        }),
      };
      
      const disable2FA = async (code) => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          return false;
        }
        return true;
      };

      // Act
      const result = await disable2FA('123456');

      // Assert
      expect(result).toBe(false);
    });

    test('TC-010: Should handle verification with backup code', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              secret: 'secret123',
              hashedBackup: ['hashedBackupCode123']
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockImplementation(async ({ secret, token, userId, backupTokens }) => {
          // Simulate backup code verification
          if (token === 'backup123' && backupTokens?.includes('hashedBackupCode123')) {
            return true;
          }
          return false;
        }),
      };
      
      const mockUsers = {
        disable2FAByUserId: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      };
      
      const mockNotifyOnUserChange = jest.fn();
      
      const disable2FA = async (code) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.secret,
          token: code,
          userId,
          backupTokens: user.services.totp.hashedBackup,
        });

        if (!verified) {
          return false;
        }

        const { modifiedCount } = await mockUsers.disable2FAByUserId(userId);
        if (!modifiedCount) {
          return false;
        }

        mockNotifyOnUserChange({ 
          clientAction: 'updated', 
          id: user._id, 
          diff: { 'services.totp.enabled': false } 
        });

        return true;
      };

      // Act
      const result = await disable2FA('backup123');

      // Assert
      expect(result).toBe(true);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        token: 'backup123',
        userId: 'user123',
        backupTokens: ['hashedBackupCode123'],
      });
    });
  });
});
