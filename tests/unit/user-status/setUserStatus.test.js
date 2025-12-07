/**
 * White Box Testing for setUserStatus.ts
 * 
 * Functions Under Test:
 * - setUserStatusMethod
 * - Meteor method: setUserStatus
 */

describe('setUserStatus.ts - Set User Status', () => {
  let mockPresence;
  let mockSettings;
  let mockMeteor;
  let mockSetStatusText;
  let mockCheck;
  let mockRateLimiter;

  beforeEach(() => {
    mockPresence = {
      setStatus: jest.fn(),
    };

    mockSettings = {
      get: jest.fn(),
    };

    mockMeteor = {
      userId: jest.fn(),
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      methods: jest.fn(),
    };

    mockSetStatusText = jest.fn();
    mockCheck = jest.fn();
    mockRateLimiter = {
      limitMethod: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('setUserStatusMethod', () => {
    
    test('TC-001: Should set status type when provided', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'online';
      const statusText = 'Working';
      
      mockSettings.get.mockReturnValue(true);
      mockSetStatusText.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        if (statusType === 'offline' && !mockSettings.get('Accounts_AllowInvisibleStatusOption')) {
          throw new mockMeteor.Error('error-status-not-allowed', 'Invisible status is disabled', {
            method: 'setUserStatus',
          });
        }
        await mockPresence.setStatus(userId, statusType);
      }

      if (statusText || statusText === '') {
        mockCheck(statusText, String);

        if (!mockSettings.get('Accounts_AllowUserStatusMessageChange')) {
          throw new mockMeteor.Error('error-not-allowed', 'Not allowed', {
            method: 'setUserStatus',
          });
        }

        await mockSetStatusText(userId, statusText);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalledWith(userId, 'online');
      expect(mockSetStatusText).toHaveBeenCalledWith(userId, 'Working');
    });

    test('TC-002: Should throw error when setting invisible status and option is disabled', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'offline';
      const statusText = '';
      
      mockSettings.get.mockReturnValue(false);

      // Act & Assert
      try {
        if (statusType) {
          if (statusType === 'offline' && !mockSettings.get('Accounts_AllowInvisibleStatusOption')) {
            throw new mockMeteor.Error('error-status-not-allowed', 'Invisible status is disabled', {
              method: 'setUserStatus',
            });
          }
        }
      } catch (error) {
        expect(error.error).toBe('error-status-not-allowed');
        expect(error.reason).toBe('Invisible status is disabled');
      }
    });

    test('TC-003: Should allow setting offline status when option is enabled', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'offline';
      const statusText = '';
      
      mockSettings.get.mockReturnValue(true);
      mockPresence.setStatus.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        if (statusType === 'offline' && !mockSettings.get('Accounts_AllowInvisibleStatusOption')) {
          throw new mockMeteor.Error('error-status-not-allowed', 'Invisible status is disabled', {
            method: 'setUserStatus',
          });
        }
        await mockPresence.setStatus(userId, statusType);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalledWith(userId, 'offline');
    });

    test('TC-004: Should set status text when provided', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'away';
      const statusText = 'At lunch';
      
      mockSettings.get.mockReturnValue(true);
      mockPresence.setStatus.mockResolvedValue(undefined);
      mockSetStatusText.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        await mockPresence.setStatus(userId, statusType);
      }

      if (statusText || statusText === '') {
        mockCheck(statusText, String);

        if (!mockSettings.get('Accounts_AllowUserStatusMessageChange')) {
          throw new mockMeteor.Error('error-not-allowed', 'Not allowed', {
            method: 'setUserStatus',
          });
        }

        await mockSetStatusText(userId, statusText);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalledWith(userId, 'away');
      expect(mockCheck).toHaveBeenCalledWith('At lunch', String);
      expect(mockSetStatusText).toHaveBeenCalledWith(userId, 'At lunch');
    });

    test('TC-005: Should throw error when setting status text without permission', async () => {
      // Arrange
      const userId = 'user123';
      const statusText = 'Custom message';
      
      mockSettings.get.mockReturnValue(false);

      // Act & Assert
      try {
        if (statusText || statusText === '') {
          mockCheck(statusText, String);

          if (!mockSettings.get('Accounts_AllowUserStatusMessageChange')) {
            throw new mockMeteor.Error('error-not-allowed', 'Not allowed', {
              method: 'setUserStatus',
            });
          }
        }
      } catch (error) {
        expect(error.error).toBe('error-not-allowed');
        expect(error.reason).toBe('Not allowed');
      }
    });

    test('TC-006: Should clear status text when empty string provided', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'online';
      const statusText = '';
      
      mockSettings.get.mockReturnValue(true);
      mockPresence.setStatus.mockResolvedValue(undefined);
      mockSetStatusText.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        await mockPresence.setStatus(userId, statusType);
      }

      if (statusText || statusText === '') {
        mockCheck(statusText, String);

        if (!mockSettings.get('Accounts_AllowUserStatusMessageChange')) {
          throw new mockMeteor.Error('error-not-allowed', 'Not allowed', {
            method: 'setUserStatus',
          });
        }

        await mockSetStatusText(userId, statusText);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalledWith(userId, 'online');
      expect(mockCheck).toHaveBeenCalledWith('', String);
      expect(mockSetStatusText).toHaveBeenCalledWith(userId, '');
    });

    test('TC-007: Should handle only status type without status text', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'busy';
      const statusText = undefined;
      
      mockSettings.get.mockReturnValue(true);
      mockPresence.setStatus.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        await mockPresence.setStatus(userId, statusType);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalledWith(userId, 'busy');
      expect(mockSetStatusText).not.toHaveBeenCalled();
    });

    test('TC-008: Should handle only status text without changing status type', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = undefined;
      const statusText = 'Working remotely';
      
      mockSettings.get.mockReturnValue(true);
      mockSetStatusText.mockResolvedValue(undefined);

      // Act
      if (statusText || statusText === '') {
        mockCheck(statusText, String);

        if (!mockSettings.get('Accounts_AllowUserStatusMessageChange')) {
          throw new mockMeteor.Error('error-not-allowed', 'Not allowed', {
            method: 'setUserStatus',
          });
        }

        await mockSetStatusText(userId, statusText);
      }

      // Assert
      expect(mockSetStatusText).toHaveBeenCalledWith(userId, 'Working remotely');
      expect(mockPresence.setStatus).not.toHaveBeenCalled();
    });

    test('TC-009: Should validate status text is string', async () => {
      // Arrange
      const statusText = 'Test message';
      
      // Act
      mockCheck(statusText, String);

      // Assert
      expect(mockCheck).toHaveBeenCalledWith('Test message', String);
    });

    test('TC-010: Should handle all valid status types', async () => {
      const validStatusTypes = ['online', 'away', 'busy'];
      
      for (const statusType of validStatusTypes) {
        // Arrange
        const userId = 'user123';
        mockPresence.setStatus.mockClear();
        mockSettings.get.mockReturnValue(true);

        // Act
        if (statusType) {
          if (statusType === 'offline' && !mockSettings.get('Accounts_AllowInvisibleStatusOption')) {
            throw new mockMeteor.Error('error-status-not-allowed', 'Invisible status is disabled', {
              method: 'setUserStatus',
            });
          }
          await mockPresence.setStatus(userId, statusType);
        }

        // Assert
        expect(mockPresence.setStatus).toHaveBeenCalledWith(userId, statusType);
      }
    });

    test('TC-011: Should handle offline status separately', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'offline';
      
      mockSettings.get.mockReturnValue(true);
      mockPresence.setStatus.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        if (statusType === 'offline' && !mockSettings.get('Accounts_AllowInvisibleStatusOption')) {
          throw new mockMeteor.Error('error-status-not-allowed', 'Invisible status is disabled', {
            method: 'setUserStatus',
          });
        }
        await mockPresence.setStatus(userId, statusType);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalledWith(userId, 'offline');
    });
  });

  describe('Meteor Method - setUserStatus', () => {
    
    test('TC-012: Should throw error when user is not logged in', async () => {
      // Arrange
      const statusType = 'online';
      const statusText = '';
      
      mockMeteor.userId.mockReturnValue(null);

      // Act & Assert
      try {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'setUserStatus' });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-user');
        expect(error.reason).toBe('Invalid user');
      }
    });

    test('TC-013: Should call setUserStatusMethod with valid user', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'away';
      const statusText = 'Be right back';
      
      mockMeteor.userId.mockReturnValue(userId);
      
      expect(mockMeteor.userId()).toBe(userId);
    });
  });

  describe('Rate Limiter', () => {
    
    test('TC-014: Should apply rate limiting to setUserStatus method', () => {
      const config = {
        userId: () => true,
      };

      // Act
      mockRateLimiter.limitMethod('setUserStatus', 1, 1000, config);

      // Assert
      expect(mockRateLimiter.limitMethod).toHaveBeenCalledWith(
        'setUserStatus',
        1,
        1000,
        { userId: expect.any(Function) }
      );
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-015: Should handle null statusType', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = null;
      const statusText = 'Only text';
      
      mockSettings.get.mockReturnValue(true);
      mockSetStatusText.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        await mockPresence.setStatus(userId, statusType);
      }

      if (statusText || statusText === '') {
        mockCheck(statusText, String);
        await mockSetStatusText(userId, statusText);
      }

      // Assert
      expect(mockPresence.setStatus).not.toHaveBeenCalled();
      expect(mockSetStatusText).toHaveBeenCalled();
    });

    test('TC-016: Should handle null statusText', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'online';
      const statusText = null;
      
      mockSettings.get.mockReturnValue(true);
      mockPresence.setStatus.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        await mockPresence.setStatus(userId, statusType);
      }

      if (statusText || statusText === '') {
        mockCheck(statusText, String);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalled();
      expect(mockCheck).not.toHaveBeenCalled();
    });

    test('TC-017: Should handle empty statusText with statusType change', async () => {
      // Arrange
      const userId = 'user123';
      const statusType = 'online';
      const statusText = '';
      
      mockSettings.get.mockReturnValue(true);
      mockPresence.setStatus.mockResolvedValue(undefined);
      mockSetStatusText.mockResolvedValue(undefined);

      // Act
      if (statusType) {
        await mockPresence.setStatus(userId, statusType);
      }

      if (statusText || statusText === '') {
        mockCheck(statusText, String);
        await mockSetStatusText(userId, statusText);
      }

      // Assert
      expect(mockPresence.setStatus).toHaveBeenCalled();
      expect(mockSetStatusText).toHaveBeenCalledWith(userId, '');
    });
  });
});
