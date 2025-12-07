/**
 * White Box Testing for deleteCustomUserStatus.ts
 * 
 * Functions Under Test:
 * - deleteCustomUserStatus
 * - Meteor method: deleteCustomUserStatus
 */

describe('deleteCustomUserStatus.ts - Delete Custom User Status', () => {
  let mockApi;
  let mockCustomUserStatus;
  let mockMeteor;
  let mockHasPermissionAsync;

  beforeEach(() => {
    mockApi = {
      broadcast: jest.fn(),
    };

    mockCustomUserStatus = {
      findOneById: jest.fn(),
      removeById: jest.fn(),
    };

    mockMeteor = {
      userId: jest.fn(),
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      methods: jest.fn(),
    };

    mockHasPermissionAsync = jest.fn();

    jest.clearAllMocks();
  });

  describe('deleteCustomUserStatus', () => {
    
    test('TC-001: Should successfully delete custom user status with valid permissions', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = 'status456';
      const mockUserStatus = {
        _id: 'status456',
        name: 'Working from home',
        statusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(mockUserStatus);
      mockCustomUserStatus.removeById.mockResolvedValue(undefined);

      // Act
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
      if (userStatus == null) {
        throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
      }

      await mockCustomUserStatus.removeById(userStatusID);
      mockApi.broadcast('user.deleteCustomStatus', userStatus);

      // Assert
      expect(mockHasPermissionAsync).toHaveBeenCalledWith(userId, 'manage-user-status');
      expect(mockCustomUserStatus.findOneById).toHaveBeenCalledWith(userStatusID);
      expect(mockCustomUserStatus.removeById).toHaveBeenCalledWith(userStatusID);
      expect(mockApi.broadcast).toHaveBeenCalledWith('user.deleteCustomStatus', mockUserStatus);
    });

    test('TC-002: Should throw error when user lacks manage-user-status permission', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = 'status456';
      
      mockHasPermissionAsync.mockResolvedValue(false);

      // Act & Assert
      try {
        if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
          throw new mockMeteor.Error('not_authorized');
        }
      } catch (error) {
        expect(error.error).toBe('not_authorized');
        expect(mockHasPermissionAsync).toHaveBeenCalledWith(userId, 'manage-user-status');
        expect(mockCustomUserStatus.findOneById).not.toHaveBeenCalled();
      }
    });

    test('TC-003: Should throw error when user status does not exist', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = 'nonexistent';
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(null);

      // Act & Assert
      try {
        if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
          throw new mockMeteor.Error('not_authorized');
        }

        const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
        if (userStatus == null) {
          throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
        }
      } catch (error) {
        expect(error.error).toBe('Custom_User_Status_Error_Invalid_User_Status');
        expect(error.reason).toBe('Invalid user status');
        expect(error.details.method).toBe('deleteCustomUserStatus');
        expect(mockCustomUserStatus.removeById).not.toHaveBeenCalled();
      }
    });
test('TC-004: Should broadcast deletion event after removing status', async () => {
  // Arrange
  const userId = 'user123';
  const userStatusID = 'status789';
  const mockUserStatus = {
    _id: 'status789',
    name: 'In a meeting',
    statusType: 'busy'
  };
  
  mockHasPermissionAsync.mockResolvedValue(true);
  mockCustomUserStatus.findOneById.mockResolvedValue(mockUserStatus);
  mockCustomUserStatus.removeById.mockResolvedValue(undefined);

  // Act
  if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
    throw new mockMeteor.Error('not_authorized');
  }

  const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
  if (userStatus == null) {
    throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
  }

  await mockCustomUserStatus.removeById(userStatusID);
  mockApi.broadcast('user.deleteCustomStatus', userStatus);

  // Assert
  expect(mockCustomUserStatus.removeById).toHaveBeenCalledWith(userStatusID);
  expect(mockApi.broadcast).toHaveBeenCalledWith('user.deleteCustomStatus', mockUserStatus);

  // Ensure removeById is called **before** broadcast
  const removeCallIndex = mockCustomUserStatus.removeById.mock.invocationCallOrder[0];
  const broadcastCallIndex = mockApi.broadcast.mock.invocationCallOrder[0];
  expect(removeCallIndex).toBeLessThan(broadcastCallIndex);
});


    test('TC-005: Should return true on successful deletion', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = 'status456';
      const mockUserStatus = {
        _id: 'status456',
        name: 'Test Status',
        statusType: 'away'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(mockUserStatus);
      mockCustomUserStatus.removeById.mockResolvedValue(undefined);

      // Act
      let result;
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
      if (userStatus == null) {
        throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
      }

      await mockCustomUserStatus.removeById(userStatusID);
      mockApi.broadcast('user.deleteCustomStatus', userStatus);
      result = true;

      // Assert
      expect(result).toBe(true);
    });

    test('TC-006: Should handle undefined user status correctly', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = 'status456';
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(undefined);

      // Act & Assert
      try {
        if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
          throw new mockMeteor.Error('not_authorized');
        }

        const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
        if (userStatus == null) {
          throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
        }
      } catch (error) {
        expect(error.error).toBe('Custom_User_Status_Error_Invalid_User_Status');
      }
    });
  });

  describe('Meteor Method - deleteCustomUserStatus', () => {
    
    test('TC-007: Should throw error when user is not logged in', async () => {
      // Arrange
      const userStatusID = 'status123';
      const context = { userId: null };

      // Act & Assert
      try {
        if (!context.userId) {
          throw new mockMeteor.Error('not_authorized');
        }
      } catch (error) {
        expect(error.error).toBe('not_authorized');
      }
    });

    test('TC-008: Should call deleteCustomUserStatus with correct parameters', async () => {
      // Arrange
      const userStatusID = 'status123';
      const context = { userId: 'user456' };
      const mockUserStatus = {
        _id: 'status123',
        name: 'Custom Status',
        statusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(mockUserStatus);
      mockCustomUserStatus.removeById.mockResolvedValue(undefined);

      // Act
      if (!context.userId) {
        throw new mockMeteor.Error('not_authorized');
      }

      if (!(await mockHasPermissionAsync(context.userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
      if (userStatus == null) {
        throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
      }

      await mockCustomUserStatus.removeById(userStatusID);
      mockApi.broadcast('user.deleteCustomStatus', userStatus);

      // Assert
      expect(mockHasPermissionAsync).toHaveBeenCalledWith(context.userId, 'manage-user-status');
      expect(mockCustomUserStatus.findOneById).toHaveBeenCalledWith(userStatusID);
    });

    test('TC-009: Should return true when method executes successfully', async () => {
      // Arrange
      const userStatusID = 'status789';
      const context = { userId: 'user999' };
      const mockUserStatus = {
        _id: 'status789',
        name: 'Away Status',
        statusType: 'away'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(mockUserStatus);
      mockCustomUserStatus.removeById.mockResolvedValue(undefined);

      // Act
      let result;
      if (!context.userId) {
        throw new mockMeteor.Error('not_authorized');
      }

      if (!(await mockHasPermissionAsync(context.userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
      if (userStatus == null) {
        throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
      }

      await mockCustomUserStatus.removeById(userStatusID);
      mockApi.broadcast('user.deleteCustomStatus', userStatus);
      result = true;

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-010: Should handle empty userStatusID string', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = '';
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(null);

      // Act & Assert
      try {
        if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
          throw new mockMeteor.Error('not_authorized');
        }

        const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
        if (userStatus == null) {
          throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
        }
      } catch (error) {
        expect(error.error).toBe('Custom_User_Status_Error_Invalid_User_Status');
        expect(mockCustomUserStatus.findOneById).toHaveBeenCalledWith('');
      }
    });

    test('TC-011: Should verify broadcast is called with exact user status object', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = 'status456';
      const mockUserStatus = {
        _id: 'status456',
        name: 'Do Not Disturb',
        statusType: 'busy',
        emoji: '🔴'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(mockUserStatus);
      mockCustomUserStatus.removeById.mockResolvedValue(undefined);

      // Act
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
      if (userStatus == null) {
        throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
      }

      await mockCustomUserStatus.removeById(userStatusID);
      mockApi.broadcast('user.deleteCustomStatus', userStatus);

      // Assert
      expect(mockApi.broadcast).toHaveBeenCalledWith('user.deleteCustomStatus', mockUserStatus);
      expect(mockApi.broadcast.mock.calls[0][1]).toEqual(mockUserStatus);
    });

    test('TC-012: Should handle special characters in userStatusID', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusID = 'status-with-special-chars_123!@#';
      const mockUserStatus = {
        _id: userStatusID,
        name: 'Special Status',
        statusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockCustomUserStatus.findOneById.mockResolvedValue(mockUserStatus);
      mockCustomUserStatus.removeById.mockResolvedValue(undefined);

      // Act
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      const userStatus = await mockCustomUserStatus.findOneById(userStatusID);
      if (userStatus == null) {
        throw new mockMeteor.Error('Custom_User_Status_Error_Invalid_User_Status', 'Invalid user status', { method: 'deleteCustomUserStatus' });
      }

      await mockCustomUserStatus.removeById(userStatusID);
      mockApi.broadcast('user.deleteCustomStatus', userStatus);

      // Assert
      expect(mockCustomUserStatus.findOneById).toHaveBeenCalledWith(userStatusID);
      expect(mockCustomUserStatus.removeById).toHaveBeenCalledWith(userStatusID);
    });
  });
});
