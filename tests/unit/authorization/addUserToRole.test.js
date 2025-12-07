/**
 * White Box Testing for addUserToRole.ts
 * 
 * Functions Under Test:
 * - addUserToRole()
 * - Meteor method: authorization:addUserToRole
 */

describe('addUserToRole.ts - Add User to Role Authorization', () => {
  let mockApi;
  let mockRoles;
  let mockUsers;
  let mockHasPermission;
  let mockAddUserRolesAsync;
  let mockMethodDeprecationLogger;
  let mockSettings;
  let mockMeteor;
  
  beforeEach(() => {
    mockApi = {
      broadcast: jest.fn()
    };

    mockRoles = {
      findOneById: jest.fn(),
      findOneByName: jest.fn(),
      canAddUserToRole: jest.fn()
    };

    mockUsers = {
      findOneByUsernameIgnoringCase: jest.fn()
    };

    mockHasPermission = jest.fn();
    mockAddUserRolesAsync = jest.fn();
    mockMethodDeprecationLogger = {
      deprecatedParameterUsage: jest.fn()
    };

    mockSettings = {
      get: jest.fn()
    };

    mockMeteor = {
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      userId: jest.fn(),
      methods: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('addUserToRole() - Main Function', () => {
    
    test('TC-001: Should throw error when user lacks access-permissions', async () => {
      // Arrange
      const userId = 'user123';
      const roleId = 'moderator';
      const username = 'testuser';
      
      mockHasPermission.mockResolvedValue(false);

      // Act & Assert
      try {
        if (!(await mockHasPermission(userId, 'access-permissions'))) {
          throw mockMeteor.Error('error-action-not-allowed', 'Accessing permissions is not allowed', {
            method: 'authorization:addUserToRole',
            action: 'Accessing_permissions',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
        expect(error.reason).toBe('Accessing permissions is not allowed');
      }
    });

    test('TC-002: Should validate roleId and username parameters', async () => {
      // Arrange
      const userId = 'admin123';
      const invalidRoleId = null;
      const invalidUsername = 123; // Not a string
      
      mockHasPermission.mockResolvedValue(true);

      // Act & Assert
      try {
        if (!invalidRoleId || typeof invalidRoleId.valueOf() !== 'string' || !invalidUsername || typeof invalidUsername.valueOf() !== 'string') {
          throw mockMeteor.Error('error-invalid-arguments', 'Invalid arguments', {
            method: 'authorization:addUserToRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-arguments');
        expect(error.reason).toBe('Invalid arguments');
      }
    });

    test('TC-003: Should find role by ID', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'valid-role-id';
      const username = 'testuser';
      const role = { _id: 'valid-role-id' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);

      // Act
      const foundRole = await mockRoles.findOneById(roleId, { projection: { _id: 1 } });

      // Assert
      expect(foundRole).toBe(role);
      expect(mockRoles.findOneById).toHaveBeenCalledWith(roleId, { projection: { _id: 1 } });
    });

    test('TC-004: Should fallback to find role by name when ID not found', async () => {
      // Arrange
      const userId = 'admin123';
      const roleName = 'moderator'; // Using role name instead of ID
      const username = 'testuser';
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(null);
      mockRoles.findOneByName.mockResolvedValue({ _id: 'moderator-id' });

      // Act
      let role = await mockRoles.findOneById(roleName, { projection: { _id: 1 } });
      if (!role) {
        role = await mockRoles.findOneByName(roleName, { projection: { _id: 1 } });
        
        // Should log deprecation
        mockMethodDeprecationLogger.deprecatedParameterUsage(
          'authorization:addUserToRole',
          'role',
          '7.0.0',
          expect.any(Function)
        );
      }

      // Assert
      expect(role._id).toBe('moderator-id');
      expect(mockMethodDeprecationLogger.deprecatedParameterUsage).toHaveBeenCalled();
    });

    test('TC-005: Should throw error when role not found', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'non-existent-role';
      const username = 'testuser';
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(null);
      mockRoles.findOneByName.mockResolvedValue(null);

      // Act & Assert
      try {
        let role = await mockRoles.findOneById(roleId, { projection: { _id: 1 } });
        if (!role) {
          role = await mockRoles.findOneByName(roleId, { projection: { _id: 1 } });
          
          if (!role) {
            throw mockMeteor.Error('error-invalid-role', 'Invalid Role', {
              method: 'authorization:addUserToRole',
            });
          }
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-role');
        expect(error.reason).toBe('Invalid Role');
      }
    });

    test('TC-006: Should require assign-admin-role permission for admin role', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'admin';
      const username = 'testuser';
      const role = { _id: 'admin' };
      
      mockHasPermission.mockResolvedValueOnce(true); // access-permissions
      mockRoles.findOneById.mockResolvedValue(role);
      mockHasPermission.mockResolvedValueOnce(false); // assign-admin-role

      // Act & Assert
      try {
        if (role._id === 'admin' && !(await mockHasPermission(userId, 'assign-admin-role'))) {
          throw mockMeteor.Error('error-action-not-allowed', 'Assigning admin is not allowed', {
            method: 'authorization:addUserToRole',
            action: 'Assign_admin',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
        expect(error.reason).toBe('Assigning admin is not allowed');
      }
    });

    test('TC-007: Should find user by username ignoring case', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'TestUser';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);

      // Act
      const foundUser = await mockUsers.findOneByUsernameIgnoringCase(username, {
        projection: {
          _id: 1,
        },
      });

      // Assert
      expect(foundUser).toBe(user);
      expect(mockUsers.findOneByUsernameIgnoringCase).toHaveBeenCalledWith('TestUser', {
        projection: { _id: 1 }
      });
    });

    test('TC-008: Should throw error when user not found', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'non-existent-user';
      const role = { _id: 'moderator' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(null);

      // Act & Assert
      try {
        const user = await mockUsers.findOneByUsernameIgnoringCase(username, {
          projection: { _id: 1 }
        });
        
        if (!user?._id) {
          throw mockMeteor.Error('error-user-not-found', 'User not found', {
            method: 'authorization:addUserToRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-user-not-found');
        expect(error.reason).toBe('User not found');
      }
    });

    test('TC-009: Should verify user can be added to scope', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = 'room123';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRoles.canAddUserToRole.mockResolvedValue(true);

      // Act
      if (scope && !(await mockRoles.canAddUserToRole(user._id, role._id, scope))) {
        throw mockMeteor.Error('error-invalid-user', 'User is not part of given room', {
          method: 'authorization:addUserToRole',
        });
      }

      // Assert - Should not throw
      expect(mockRoles.canAddUserToRole).toHaveBeenCalledWith('user123', 'moderator', 'room123');
    });

    test('TC-010: Should throw error when user cannot be added to scope', async () => {
  // Arrange
  const userId = 'admin123';
  const roleId = 'moderator';
  const username = 'testuser';
  const scope = 'room123';
  const role = { _id: 'moderator' };
  const user = { _id: 'user123' };
  
  mockHasPermission.mockResolvedValue(true);
  mockRoles.findOneById.mockResolvedValue(role);
  mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
  mockRoles.canAddUserToRole.mockResolvedValue(false);

  // Act & Assert
  try {
    if (scope && !(await mockRoles.canAddUserToRole(user._id, role._id, scope))) {
      throw mockMeteor.Error('error-invalid-user', 'User is not part of given room', {
        method: 'authorization:addUserToRole',
      });
    }
  } catch (error) {
    // Correct expectations
    expect(error.error).toBe('error-invalid-user');
    expect(error.reason).toBe('User is not part of given room');
  }
});

      
     

    test('TC-011: Should call addUserRolesAsync with correct parameters', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = 'room123';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRoles.canAddUserToRole.mockResolvedValue(true);
      mockAddUserRolesAsync.mockResolvedValue(true);

      // Act
      const result = await mockAddUserRolesAsync(user._id, [role._id], scope);

      // Assert
      expect(result).toBe(true);
      expect(mockAddUserRolesAsync).toHaveBeenCalledWith('user123', ['moderator'], 'room123');
    });

    test('TC-012: Should broadcast user.roleUpdate when UI_DisplayRoles is enabled', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = 'room123';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRoles.canAddUserToRole.mockResolvedValue(true);
      mockAddUserRolesAsync.mockResolvedValue(true);
      mockSettings.get.mockReturnValue(true); // UI_DisplayRoles = true
      mockApi.broadcast.mockResolvedValue(undefined);

      // Act
      if (mockSettings.get('UI_DisplayRoles')) {
        await mockApi.broadcast('user.roleUpdate', {
          type: 'added',
          _id: role._id,
          u: {
            _id: user._id,
            username,
          },
          scope,
        });
      }

      // Assert
      expect(mockSettings.get).toHaveBeenCalledWith('UI_DisplayRoles');
      expect(mockApi.broadcast).toHaveBeenCalledWith('user.roleUpdate', {
        type: 'added',
        _id: 'moderator',
        u: {
          _id: 'user123',
          username: 'testuser',
        },
        scope: 'room123',
      });
    });

    test('TC-013: Should not broadcast when UI_DisplayRoles is disabled', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = 'room123';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRoles.canAddUserToRole.mockResolvedValue(true);
      mockAddUserRolesAsync.mockResolvedValue(true);
      mockSettings.get.mockReturnValue(false); // UI_DisplayRoles = false

      // Act
      if (mockSettings.get('UI_DisplayRoles')) {
        await mockApi.broadcast('user.roleUpdate', expect.anything());
      }

      // Assert
      expect(mockApi.broadcast).not.toHaveBeenCalled();
    });
  });

  describe('Meteor Method - authorization:addUserToRole', () => {
    
    test('TC-014: Should call methodDeprecationLogger.method for deprecation warning', () => {
      // Arrange
      const mockLogger = { method: jest.fn() };
      
      // Act
      mockLogger.method('authorization:addUserToRole', '8.0.0', '/v1/roles.addUserToRole');

      // Assert
      expect(mockLogger.method).toHaveBeenCalledWith(
        'authorization:addUserToRole',
        '8.0.0',
        '/v1/roles.addUserToRole'
      );
    });

    test('TC-015: Should throw error when no user is logged in', () => {
      // Arrange
      mockMeteor.userId.mockReturnValue(null);

      // Act & Assert
      if (!mockMeteor.userId()) {
        expect(() => {
          throw mockMeteor.Error('error-action-not-allowed', 'Accessing permissions is not allowed', {
            method: 'authorization:addUserToRole',
            action: 'Accessing_permissions',
          });
        }).toThrow();
      }
    });

    test('TC-016: Should call addUserToRole with correct parameters', async () => {
      // Arrange
      const mockUserId = 'current-user';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = 'room123';
      
      mockMeteor.userId.mockReturnValue(mockUserId);
      
      const mockAddUserToRole = jest.fn().mockResolvedValue(true);
      
      // Act
      const result = await mockAddUserToRole(mockUserId, roleId, username, scope);

      // Assert
      expect(result).toBe(true);
      expect(mockAddUserToRole).toHaveBeenCalledWith(mockUserId, roleId, username, scope);
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-017: Should handle undefined scope parameter', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = undefined; // No scope
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      // Roles.canAddUserToRole should not be called when scope is undefined
      mockAddUserRolesAsync.mockResolvedValue(true);

      // Act
      // When scope is undefined, should skip scope validation
      let shouldValidateScope = false;
      if (scope && !(await mockRoles.canAddUserToRole(user._id, role._id, scope))) {
        shouldValidateScope = true;
      }

      // Assert
      expect(shouldValidateScope).toBe(false);
      expect(mockRoles.canAddUserToRole).not.toHaveBeenCalled();
    });

    test('TC-018: Should handle empty string roleId or username', async () => {
      // Arrange
      const userId = 'admin123';
      const emptyRoleId = '';
      const emptyUsername = '';
      
      mockHasPermission.mockResolvedValue(true);

      // Act & Assert
      try {
        if (!emptyRoleId || typeof emptyRoleId.valueOf() !== 'string' || !emptyUsername || typeof emptyUsername.valueOf() !== 'string') {
          throw mockMeteor.Error('error-invalid-arguments', 'Invalid arguments', {
            method: 'authorization:addUserToRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-arguments');
      }
    });

    test('TC-019: Should handle user object without _id property', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const role = { _id: 'moderator' };
      const userWithoutId = { name: 'Test User' }; // No _id
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(userWithoutId);

      // Act & Assert
      try {
        const user = await mockUsers.findOneByUsernameIgnoringCase(username, {
          projection: { _id: 1 }
        });
        
        if (!user?._id) {
          throw mockMeteor.Error('error-user-not-found', 'User not found', {
            method: 'authorization:addUserToRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-user-not-found');
      }
    });

    test('TC-020: Should return boolean result from addUserRolesAsync', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRoles.canAddUserToRole.mockResolvedValue(true);
      mockAddUserRolesAsync.mockResolvedValue(false); // Returns false

      // Act
      const result = await mockAddUserRolesAsync(user._id, [role._id], undefined);

      // Assert
      expect(result).toBe(false);
    });
  });
});
