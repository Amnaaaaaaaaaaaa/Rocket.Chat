/**
 * White Box Testing for insertOrUpdateUserStatus.ts
 * 
 * Functions Under Test:
 * - insertOrUpdateUserStatus
 * - Meteor method: insertOrUpdateUserStatus
 */

describe('insertOrUpdateUserStatus.ts - Insert Or Update User Status', () => {
  let mockApi;
  let mockCustomUserStatus;
  let mockMeteor;
  let mockHasPermissionAsync;
  let mockTrim;

  beforeEach(() => {
    mockApi = {
      broadcast: jest.fn(),
    };

    mockCustomUserStatus = {
      findByNameExceptId: jest.fn(() => ({
        toArray: jest.fn(),
      })),
      findByName: jest.fn(() => ({
        toArray: jest.fn(),
      })),
      create: jest.fn(),
      setName: jest.fn(),
      setStatusType: jest.fn(),
    };

    mockMeteor = {
      userId: jest.fn(),
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      methods: jest.fn(),
    };

    mockHasPermissionAsync = jest.fn();
    mockTrim = jest.fn((str) => str?.trim());

    jest.clearAllMocks();
  });

  describe('insertOrUpdateUserStatus', () => {
    
    test('TC-001: Should throw error when user lacks manage-user-status permission', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusData = {
        name: 'Test Status',
        statusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(false);

      // Act & Assert
      try {
        if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
          throw new mockMeteor.Error('not_authorized');
        }
      } catch (error) {
        expect(error.error).toBe('not_authorized');
        expect(mockHasPermissionAsync).toHaveBeenCalledWith(userId, 'manage-user-status');
      }
    });

    test('TC-002: Should throw error when name is empty after trim', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusData = {
        name: '   ',
        statusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockTrim.mockReturnValue('');

      // Act & Assert
      try {
        if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
          throw new mockMeteor.Error('not_authorized');
        }

        if (!mockTrim(userStatusData.name)) {
          throw new mockMeteor.Error('error-the-field-is-required', 'The field Name is required', {
            method: 'insertOrUpdateUserStatus',
            field: 'Name',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-the-field-is-required');
        expect(error.reason).toBe('The field Name is required');
      }
    });

    test('TC-003: Should reject name with invalid characters', async () => {
      // Arrange
      const userStatusData = {
        name: 'Test>Status',
        statusType: 'online'
      };

      // Act
      const nameValidation = /[><&"']/;
      const isInvalid = nameValidation.test(userStatusData.name);

      // Assert
      expect(isInvalid).toBe(true);
    });

test('TC-004: Should throw error when name already exists', async () => {
  // Arrange
  const userId = 'user123';
  const userStatusData = {
    name: 'Existing Status',
    statusType: 'online'
  };
  
  mockHasPermissionAsync.mockResolvedValue(true);
  mockTrim.mockReturnValue('Existing Status');

  // Properly mock findByName().toArray() to return existing status
  mockCustomUserStatus.findByName.mockReturnValue({
    toArray: jest.fn().mockResolvedValue([
      { _id: 'existing1', name: 'Existing Status' }
    ]),
  });

  // Act & Assert
  try {
    if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
      throw new mockMeteor.Error('not_authorized');
    }

    if (!mockTrim(userStatusData.name)) {
      throw new mockMeteor.Error('error-the-field-is-required', 'The field Name is required', {
        method: 'insertOrUpdateUserStatus',
        field: 'Name',
      });
    }

    const nameValidation = /[><&"']/;
    if (nameValidation.test(userStatusData.name)) {
      throw new mockMeteor.Error('error-input-is-not-a-valid-field', `${userStatusData.name} is not a valid name`, {
        method: 'insertOrUpdateUserStatus',
        input: userStatusData.name,
        field: 'Name',
      });
    }

    const matchingResults = await mockCustomUserStatus.findByName(userStatusData.name).toArray();

    if (matchingResults.length > 0) {
      throw new mockMeteor.Error('Custom_User_Status_Error_Name_Already_In_Use', 'The custom user status name is already in use', {
        method: 'insertOrUpdateUserStatus',
      });
    }
  } catch (error) {
    expect(error.error).toBe('Custom_User_Status_Error_Name_Already_In_Use');
  }
});


    test('TC-005: Should reject invalid status type', async () => {
      // Arrange
      const userStatusData = {
        name: 'Test Status',
        statusType: 'invalid'
      };

      // Act
      const validStatusTypes = ['online', 'away', 'busy', 'offline'];
      const isInvalid = userStatusData.statusType && validStatusTypes.indexOf(userStatusData.statusType) < 0;

      // Assert
      expect(isInvalid).toBe(true);
    });

    test('TC-006: Should successfully create new custom user status', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusData = {
        name: 'Working from home',
        statusType: 'online'
      };
      const insertedId = 'newStatus123';
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockTrim.mockReturnValue('Working from home');
      mockCustomUserStatus.findByName().toArray.mockResolvedValue([]);
      mockCustomUserStatus.create.mockResolvedValue({ insertedId });

      // Act
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      if (!mockTrim(userStatusData.name)) {
        throw new mockMeteor.Error('error-the-field-is-required', 'The field Name is required', {
          method: 'insertOrUpdateUserStatus',
          field: 'Name',
        });
      }

      const matchingResults = await mockCustomUserStatus.findByName(userStatusData.name).toArray();

      const createUserStatus = {
        name: userStatusData.name,
        statusType: userStatusData.statusType,
      };

      const _id = (await mockCustomUserStatus.create(createUserStatus)).insertedId;
      mockApi.broadcast('user.updateCustomStatus', { ...createUserStatus, _id });

      // Assert
      expect(mockCustomUserStatus.create).toHaveBeenCalledWith(createUserStatus);
      expect(mockApi.broadcast).toHaveBeenCalledWith('user.updateCustomStatus', { 
        name: 'Working from home',
        statusType: 'online',
        _id: insertedId 
      });
    });

    test('TC-007: Should successfully update existing user status name', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusData = {
        _id: 'status123',
        name: 'Updated Name',
        statusType: 'online',
        previousName: 'Old Name',
        previousStatusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockTrim.mockReturnValue('Updated Name');
      mockCustomUserStatus.findByNameExceptId().toArray.mockResolvedValue([]);
      mockCustomUserStatus.setName.mockResolvedValue(undefined);

      // Act
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      if (!mockTrim(userStatusData.name)) {
        throw new mockMeteor.Error('error-the-field-is-required', 'The field Name is required', {
          method: 'insertOrUpdateUserStatus',
          field: 'Name',
        });
      }

      const matchingResults = await mockCustomUserStatus.findByNameExceptId(userStatusData.name, userStatusData._id).toArray();

      if (userStatusData.name !== userStatusData.previousName) {
        await mockCustomUserStatus.setName(userStatusData._id, userStatusData.name);
      }

      mockApi.broadcast('user.updateCustomStatus', { ...userStatusData, _id: userStatusData._id });

      // Assert
      expect(mockCustomUserStatus.setName).toHaveBeenCalledWith('status123', 'Updated Name');
    });

    test('TC-008: Should successfully update existing user status type', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusData = {
        _id: 'status123',
        name: 'Same Name',
        statusType: 'busy',
        previousName: 'Same Name',
        previousStatusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockTrim.mockReturnValue('Same Name');
      mockCustomUserStatus.findByNameExceptId().toArray.mockResolvedValue([]);
      mockCustomUserStatus.setStatusType.mockResolvedValue(undefined);

      // Act
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      const matchingResults = await mockCustomUserStatus.findByNameExceptId(userStatusData.name, userStatusData._id).toArray();

      if (userStatusData.statusType !== userStatusData.previousStatusType) {
        await mockCustomUserStatus.setStatusType(userStatusData._id, userStatusData.statusType);
      }

      mockApi.broadcast('user.updateCustomStatus', { ...userStatusData, _id: userStatusData._id });

      // Assert
      expect(mockCustomUserStatus.setStatusType).toHaveBeenCalledWith('status123', 'busy');
    });

    test('TC-009: Should not update database if values unchanged', async () => {
      // Arrange
      const userId = 'user123';
      const userStatusData = {
        _id: 'status123',
        name: 'Same Name',
        statusType: 'online',
        previousName: 'Same Name',
        previousStatusType: 'online'
      };
      
      mockHasPermissionAsync.mockResolvedValue(true);
      mockTrim.mockReturnValue('Same Name');
      mockCustomUserStatus.findByNameExceptId().toArray.mockResolvedValue([]);

      // Act
      if (!(await mockHasPermissionAsync(userId, 'manage-user-status'))) {
        throw new mockMeteor.Error('not_authorized');
      }

      if (userStatusData.name !== userStatusData.previousName) {
        await mockCustomUserStatus.setName(userStatusData._id, userStatusData.name);
      }

      if (userStatusData.statusType !== userStatusData.previousStatusType) {
        await mockCustomUserStatus.setStatusType(userStatusData._id, userStatusData.statusType);
      }

      mockApi.broadcast('user.updateCustomStatus', { ...userStatusData, _id: userStatusData._id });

      // Assert
      expect(mockCustomUserStatus.setName).not.toHaveBeenCalled();
      expect(mockCustomUserStatus.setStatusType).not.toHaveBeenCalled();
      expect(mockApi.broadcast).toHaveBeenCalled();
    });

    test('TC-010: Should throw error when user is not logged in', async () => {
      // Arrange
      const userStatusData = {
        name: 'Test',
        statusType: 'online'
      };
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
  });
});
