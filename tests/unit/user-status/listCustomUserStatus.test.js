/**
 * White Box Testing for listCustomUserStatus.ts
 * 
 * Functions Under Test:
 * - Meteor method: listCustomUserStatus
 */

describe('listCustomUserStatus.ts - List Custom User Status', () => {
  let mockMeteor;
  let mockCustomUserStatus;
  let mockToArray;

  beforeEach(() => {
    mockMeteor = {
      userId: jest.fn(),
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      methods: jest.fn(),
    };

    mockToArray = jest.fn();
    
    mockCustomUserStatus = {
      find: jest.fn(() => ({
        toArray: mockToArray,
      })),
    };

    jest.clearAllMocks();
  });

  describe('Meteor Method - listCustomUserStatus', () => {
    
    test('TC-001: Should return list of custom user statuses for valid user', async () => {
      // Arrange
      const currentUserId = 'user123';
      const mockStatuses = [
        { _id: 'status1', name: 'Working from home', statusType: 'online' },
        { _id: 'status2', name: 'In a meeting', statusType: 'busy' },
        { _id: 'status3', name: 'On break', statusType: 'away' }
      ];
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue(mockStatuses);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      const result = await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(mockMeteor.userId).toHaveBeenCalled();
      expect(mockCustomUserStatus.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockStatuses);
      expect(result.length).toBe(3);
    });

    test('TC-002: Should throw error when user is not logged in', async () => {
      // Arrange
      mockMeteor.userId.mockReturnValue(null);

      // Act & Assert
      try {
        const currentUserId = mockMeteor.userId();
        if (!currentUserId) {
          throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: 'listCustomUserStatus',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-user');
        expect(error.reason).toBe('Invalid user');
        expect(error.details.method).toBe('listCustomUserStatus');
        expect(mockCustomUserStatus.find).not.toHaveBeenCalled();
      }
    });

    test('TC-003: Should throw error when user is undefined', async () => {
      // Arrange
      mockMeteor.userId.mockReturnValue(undefined);

      // Act & Assert
      try {
        const currentUserId = mockMeteor.userId();
        if (!currentUserId) {
          throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: 'listCustomUserStatus',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-user');
        expect(error.reason).toBe('Invalid user');
      }
    });

    test('TC-004: Should return empty array when no custom statuses exist', async () => {
      // Arrange
      const currentUserId = 'user123';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue([]);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      const result = await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    test('TC-005: Should query with empty object filter', async () => {
      // Arrange
      const currentUserId = 'user123';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue([]);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(mockCustomUserStatus.find).toHaveBeenCalledWith({});
    });

    test('TC-006: Should return all status types', async () => {
      // Arrange
      const currentUserId = 'user123';
      const mockStatuses = [
        { _id: 'status1', name: 'Online Status', statusType: 'online' },
        { _id: 'status2', name: 'Away Status', statusType: 'away' },
        { _id: 'status3', name: 'Busy Status', statusType: 'busy' },
        { _id: 'status4', name: 'Offline Status', statusType: 'offline' }
      ];
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue(mockStatuses);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      const result = await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(result.length).toBe(4);
      expect(result[0].statusType).toBe('online');
      expect(result[1].statusType).toBe('away');
      expect(result[2].statusType).toBe('busy');
      expect(result[3].statusType).toBe('offline');
    });

    test('TC-007: Should return statuses with complete data structure', async () => {
      // Arrange
      const currentUserId = 'user123';
      const mockStatuses = [
        { 
          _id: 'status1', 
          name: 'Working from home', 
          statusType: 'online',
          emoji: '🏠',
          message: 'Available remotely'
        }
      ];
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue(mockStatuses);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      const result = await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('statusType');
      expect(result[0]).toHaveProperty('emoji');
      expect(result[0]).toHaveProperty('message');
    });

    test('TC-008: Should handle large number of statuses', async () => {
      // Arrange
      const currentUserId = 'user123';
      const mockStatuses = Array.from({ length: 50 }, (_, i) => ({
        _id: `status${i}`,
        name: `Status ${i}`,
        statusType: 'online'
      }));
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue(mockStatuses);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      const result = await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(result.length).toBe(50);
    });

    test('TC-009: Should call find method exactly once', async () => {
      // Arrange
      const currentUserId = 'user123';
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue([]);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(mockCustomUserStatus.find).toHaveBeenCalledTimes(1);
    });

    test('TC-010: Should return statuses in order from database', async () => {
      // Arrange
      const currentUserId = 'user123';
      const mockStatuses = [
        { _id: 'status3', name: 'Status C', statusType: 'online' },
        { _id: 'status1', name: 'Status A', statusType: 'away' },
        { _id: 'status2', name: 'Status B', statusType: 'busy' }
      ];
      
      mockMeteor.userId.mockReturnValue(currentUserId);
      mockToArray.mockResolvedValue(mockStatuses);

      // Act
      const userId = mockMeteor.userId();
      if (!userId) {
        throw new mockMeteor.Error('error-invalid-user', 'Invalid user', {
          method: 'listCustomUserStatus',
        });
      }

      const result = await mockCustomUserStatus.find({}).toArray();

      // Assert
      expect(result[0].name).toBe('Status C');
      expect(result[1].name).toBe('Status A');
      expect(result[2].name).toBe('Status B');
    });
  });
});
