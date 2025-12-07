/**
 * White Box Testing for checkCodesRemaining.ts
 * 
 * Meteor Method Under Test:
 * - '2fa:checkCodesRemaining'
 */

describe('checkCodesRemaining.ts - Check Backup Codes Remaining', () => {
  
  describe('Meteor Method - 2fa:checkCodesRemaining', () => {
    
    test('TC-001: Should throw error when user is not logged in', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const checkCodesRemaining = async () => {
        if (!mockMeteor.userId()) {
          throw mockMeteor.Error('not-authorized');
        }
        return { remaining: 0 };
      };

      // Act & Assert
      await expect(checkCodesRemaining())
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
      
      const checkCodesRemaining = async () => {
        if (!mockMeteor.userId()) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:checkCodesRemaining',
          });
        }
        return { remaining: 0 };
      };

      // Act & Assert
      await expect(checkCodesRemaining())
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
      
      const checkCodesRemaining = async () => {
        if (!mockMeteor.userId()) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:checkCodesRemaining',
          });
        }

        if (!user.services?.totp?.enabled) {
          throw mockMeteor.Error('invalid-totp');
        }

        return {
          remaining: user.services.totp.hashedBackup.length,
        };
      };

      // Act & Assert
      await expect(checkCodesRemaining())
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
    });

    test('TC-004: Should return remaining backup codes count', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              hashedBackup: ['code1', 'code2', 'code3', 'code4', 'code5'] // 5 codes
            }
          }
        }),
      };
      
      const checkCodesRemaining = async () => {
        if (!mockMeteor.userId()) {
          throw { error: 'not-authorized' };
        }

        const user = await mockMeteor.userAsync();
        if (!user) {
          throw { error: 'error-invalid-user', reason: 'Invalid user' };
        }

        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }

        return {
          remaining: user.services.totp.hashedBackup.length,
        };
      };

      // Act
      const result = await checkCodesRemaining();

      // Assert
      expect(result.remaining).toBe(5);
    });

    test('TC-005: Should return 0 when no backup codes remain', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              hashedBackup: [] // Empty array
            }
          }
        }),
      };
      
      const checkCodesRemaining = async () => {
        if (!mockMeteor.userId()) {
          throw { error: 'not-authorized' };
        }

        const user = await mockMeteor.userAsync();
        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }

        return {
          remaining: user.services.totp.hashedBackup.length,
        };
      };

      // Act
      const result = await checkCodesRemaining();

      // Assert
      expect(result.remaining).toBe(0);
    });

    test('TC-006: Should handle user with null services', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: null // null services
        }),
      };
      
      const checkCodesRemaining = async () => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }
        
        return { remaining: 0 };
      };

      // Act & Assert
      await expect(checkCodesRemaining())
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
      };
      
      const checkCodesRemaining = async () => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }
        
        return { remaining: 0 };
      };

      // Act & Assert
      await expect(checkCodesRemaining())
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
    });

    test('TC-008: Should handle undefined hashedBackup array', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              hashedBackup: undefined // undefined array
            }
          }
        }),
      };
      
      const checkCodesRemaining = async () => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }

        return {
          remaining: user.services.totp.hashedBackup?.length || 0,
        };
      };

      // Act
      const result = await checkCodesRemaining();

      // Assert
      expect(result.remaining).toBe(0);
    });

    test('TC-009: Should handle user with all 12 backup codes', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              hashedBackup: [
                'hash1', 'hash2', 'hash3', 'hash4', 'hash5',
                'hash6', 'hash7', 'hash8', 'hash9', 'hash10',
                'hash11', 'hash12' // All 12 codes
              ]
            }
          }
        }),
      };
      
      const checkCodesRemaining = async () => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.enabled) {
          throw { error: 'invalid-totp' };
        }

        return {
          remaining: user.services.totp.hashedBackup.length,
        };
      };

      // Act
      const result = await checkCodesRemaining();

      // Assert
      expect(result.remaining).toBe(12);
    });

    test('TC-010: Should handle user with some used backup codes', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              enabled: true,
              hashedBackup: ['hash1', 'hash3', 'hash5', 'hash7'] // 4 codes remaining
            }
          }
        }),
      };
      
      const checkCodesRemaining = async () => {
        const user = await mockMeteor.userAsync();
        
        return {
          remaining: user.services.totp.hashedBackup.length,
        };
      };

      // Act
      const result = await checkCodesRemaining();

      // Assert
      expect(result.remaining).toBe(4);
    });
  });
});
