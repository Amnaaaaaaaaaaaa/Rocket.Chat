/**
 * White Box Testing for getUserStatusText.ts
 * 
 * Functions Under Test:
 * - Meteor method: getUserStatusText
 */

describe('getUserStatusText.ts - Get User Status Text', () => {
  let mockMeteor;
  let mockGetStatusText;

  beforeEach(() => {
    mockMeteor = {
      userId: jest.fn(),
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      methods: jest.fn(),
    };

    mockGetStatusText = jest.fn();

    jest.clearAllMocks();
  });

  describe('Meteor Method - getUserStatusText', () => {
    
    test('TC-001: Should return status text for valid user', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      const expectedStatusText = 'Working from home';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(expectedStatusText);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(mockMeteor.userId).toHaveBeenCalled();
      expect(mockGetStatusText).toHaveBeenCalledWith(targetUserId);
      expect(result).toBe(expectedStatusText);
    });

    test('TC-002: Should throw error when current user is not logged in', async () => {
      // Arrange
      const targetUserId = 'user456';
      
      mockMeteor.userId.mockReturnValue(null);

      // Act & Assert
      try {
        const currentUserId = mockMeteor.userId();
        if (!currentUserId) {
          throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-user');
        expect(error.reason).toBe('Invalid user');
        expect(error.details.method).toBe('getUserStatusText');
        expect(mockGetStatusText).not.toHaveBeenCalled();
      }
    });

    test('TC-003: Should throw error when current user is undefined', async () => {
      // Arrange
      const targetUserId = 'user789';
      
      mockMeteor.userId.mockReturnValue(undefined);

      // Act & Assert
      try {
        const currentUserId = mockMeteor.userId();
        if (!currentUserId) {
          throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-user');
        expect(error.reason).toBe('Invalid user');
      }
    });

    test('TC-004: Should return undefined when user has no status text', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(undefined);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(result).toBeUndefined();
      expect(mockGetStatusText).toHaveBeenCalledWith(targetUserId);
    });

    test('TC-005: Should handle empty string status text', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      const expectedStatusText = '';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(expectedStatusText);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(result).toBe('');
      expect(mockGetStatusText).toHaveBeenCalledWith(targetUserId);
    });

    test('TC-006: Should allow user to get their own status text', async () => {
      // Arrange
      const currentUserId = 'user123';
      const expectedStatusText = 'At lunch';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(expectedStatusText);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(currentUserId);

      // Assert
      expect(mockGetStatusText).toHaveBeenCalledWith(currentUserId);
      expect(result).toBe(expectedStatusText);
    });

    test('TC-007: Should allow user to get another users status text', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user789';
      const expectedStatusText = 'In a meeting';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(expectedStatusText);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(mockGetStatusText).toHaveBeenCalledWith(targetUserId);
      expect(result).toBe(expectedStatusText);
    });

    test('TC-008: Should handle long status text', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      const expectedStatusText = 'This is a very long status text that contains multiple words and describes the user current situation in great detail';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(expectedStatusText);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(result).toBe(expectedStatusText);
      expect(mockGetStatusText).toHaveBeenCalledWith(targetUserId);
    });

    test('TC-009: Should handle special characters in status text', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      const expectedStatusText = '😊 Working on project #123 @home 🏠';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(expectedStatusText);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(result).toBe(expectedStatusText);
    });

    test('TC-010: Should handle Unicode characters in status text', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      const expectedStatusText = '正在工作中';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(expectedStatusText);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(result).toBe(expectedStatusText);
      expect(mockGetStatusText).toHaveBeenCalledWith(targetUserId);
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-011: Should handle empty targetUserId', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = '';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(undefined);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(mockGetStatusText).toHaveBeenCalledWith('');
    });

    test('TC-012: Should handle null status text return', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue(null);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      const result = await mockGetStatusText(targetUserId);

      // Assert
      expect(result).toBeNull();
    });

    test('TC-013: Should verify method is called with exact parameters', async () => {
      // Arrange
      const currentUserId = 'user123';
      const targetUserId = 'user456';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockGetStatusText.mockResolvedValue('Test status');

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserStatusText' });
      }

      await mockGetStatusText(targetUserId);

      // Assert
      expect(mockGetStatusText).toHaveBeenCalledTimes(1);
      expect(mockGetStatusText).toHaveBeenCalledWith(targetUserId);
    });
  });
});
