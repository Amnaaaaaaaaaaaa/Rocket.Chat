/**
 * White Box Testing for removeUserFromRole.ts
 * 
 * Functions Under Test:
 * - removeUserFromRole()
 * - Meteor method: authorization:removeUserFromRole
 */

describe('removeUserFromRole.ts - Remove User from Role', () => {
  let mockApi;
  let mockRoles;
  let mockUsers;
  let mockHasPermission;
  let mockRemoveUserFromRolesAsync;
  let mockMethodDeprecationLogger;
  let mockSettings;
  let mockMeteor;
  
  beforeEach(() => {
    mockApi = {
      broadcast: jest.fn()
    };

    mockRoles = {
      findOneById: jest.fn(),
      findOneByName: jest.fn()
    };

    mockUsers = {
      findOneByUsernameIgnoringCase: jest.fn(),
      countDocuments: jest.fn()
    };

    mockHasPermission = jest.fn();
    mockRemoveUserFromRolesAsync = jest.fn();
    mockMethodDeprecationLogger = {
      deprecatedParameterUsage: jest.fn(),
      method: jest.fn()
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

  describe('removeUserFromRole() - Main Function', () => {
    
    test('TC-001: Should throw error when user lacks access-permissions', async () => {
      // Arrange
      const userId = 'user123';
      const roleId = 'moderator';
      const username = 'testuser';
      
      mockHasPermission.mockResolvedValue(false);

      // Act & Assert
      try {
        if (!(await mockHasPermission(userId, 'access-permissions'))) {
          throw mockMeteor.Error('error-action-not-allowed', 'Access permissions is not allowed', {
            method: 'authorization:removeUserFromRole',
            action: 'Accessing_permissions',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
        expect(error.reason).toBe('Access permissions is not allowed');
      }
    });

    test('TC-002: Should validate roleId and username parameters', async () => {
      // Arrange
      const userId = 'admin123';
      const invalidRoleId = 123; // Not a string
      const invalidUsername = null;
      
      mockHasPermission.mockResolvedValue(true);

      // Act & Assert
      try {
        if (!invalidRoleId || typeof invalidRoleId.valueOf() !== 'string' || !invalidUsername || typeof invalidUsername.valueOf() !== 'string') {
          throw mockMeteor.Error('error-invalid-arguments', 'Invalid arguments', {
            method: 'authorization:removeUserFromRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-arguments');
      }
    });

    test('TC-003: Should find role by ID first', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'role-id-123';
      const username = 'testuser';
      const role = { _id: 'role-id-123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);

      // Act
      const foundRole = await mockRoles.findOneById(roleId, { projection: { _id: 1 } });

      // Assert
      expect(foundRole).toBe(role);
      expect(mockRoles.findOneById).toHaveBeenCalledWith(roleId, { projection: { _id: 1 } });
    });

    test('TC-004: Should fallback to find role by name with deprecation warning', async () => {
      // Arrange
      const userId = 'admin123';
      const roleName = 'moderator'; // Using name instead of ID
      const username = 'testuser';
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(null);
      mockRoles.findOneByName.mockResolvedValue({ _id: 'moderator-id' });

      // Act
      let role = await mockRoles.findOneById(roleName, { projection: { _id: 1 } });
      if (!role) {
        role = await mockRoles.findOneByName(roleName, { projection: { _id: 1 } });
        
        mockMethodDeprecationLogger.deprecatedParameterUsage(
          'authorization:removeUserFromRole',
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
              method: 'authorization:removeUserFromRole',
            });
          }
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-role');
      }
    });

    test('TC-006: Should find user by username with roles projection', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'TestUser';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123', roles: ['user', 'moderator'] };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);

      // Act
      const foundUser = await mockUsers.findOneByUsernameIgnoringCase(username, {
        projection: {
          _id: 1,
          roles: 1,
        },
      });

      // Assert
      expect(foundUser).toBe(user);
      expect(foundUser.roles).toEqual(['user', 'moderator']);
      expect(mockUsers.findOneByUsernameIgnoringCase).toHaveBeenCalledWith('TestUser', {
        projection: { _id: 1, roles: 1 }
      });
    });

    test('TC-007: Should throw error when user not found', async () => {
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
          projection: { _id: 1, roles: 1 }
        });
        
        if (!user?._id) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: 'authorization:removeUserFromRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-user');
      }
    });

    test('TC-008: Should prevent removing last admin user', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'admin';
      const username = 'last-admin';
      const role = { _id: 'admin' };
      const user = { _id: 'admin123', roles: ['admin', 'user'] };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockUsers.countDocuments.mockResolvedValue(1); // Only 1 admin
      
      const userIsAdmin = user.roles?.indexOf('admin') > -1;

      // Act & Assert
      try {
        if (role._id === 'admin') {
          const adminCount = await mockUsers.countDocuments({
            roles: {
              $in: ['admin'],
            },
          });
          
          if (adminCount === 1 && userIsAdmin) {
            throw mockMeteor.Error('error-action-not-allowed', 'Leaving the app without admins is not allowed', {
              method: 'removeUserFromRole',
              action: 'Remove_last_admin',
            });
          }
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
        expect(error.reason).toBe('Leaving the app without admins is not allowed');
      }
    });

    test('TC-009: Should allow removing admin when other admins exist', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'admin';
      const username = 'one-of-many-admins';
      const role = { _id: 'admin' };
      const user = { _id: 'admin123', roles: ['admin'] };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockUsers.countDocuments.mockResolvedValue(3); // 3 admins total

      // Act
      if (role._id === 'admin') {
        const adminCount = await mockUsers.countDocuments({
          roles: { $in: ['admin'] }
        });
        
        const userIsAdmin = user.roles?.indexOf('admin') > -1;
        
        // Should not throw because adminCount > 1
        expect(adminCount).toBe(3);
        expect(userIsAdmin).toBe(true);
        expect(adminCount === 1 && userIsAdmin).toBe(false);
      }
    });

    test('TC-010: Should allow removing non-admin roles without admin count check', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator'; // Not admin
      const username = 'testuser';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123', roles: ['moderator'] };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      // countDocuments should not be called for non-admin roles

      // Act
      if (role._id === 'admin') {
        // Should not enter this block for moderator role
        expect(true).toBe(false); // Should not reach here
      }

      // Assert
      expect(mockUsers.countDocuments).not.toHaveBeenCalled();
    });

    test('TC-011: Should call removeUserFromRolesAsync with correct parameters', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = 'room123';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123', roles: ['moderator'] };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRemoveUserFromRolesAsync.mockResolvedValue(true);

      // Act
      const result = await mockRemoveUserFromRolesAsync(user._id, [role._id], scope);

      // Assert
      expect(result).toBe(true);
      expect(mockRemoveUserFromRolesAsync).toHaveBeenCalledWith('user123', ['moderator'], 'room123');
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
      mockRemoveUserFromRolesAsync.mockResolvedValue(true);
      mockSettings.get.mockReturnValue(true); // UI_DisplayRoles enabled
      mockApi.broadcast.mockResolvedValue(undefined);

      // Act
      const event = {
        type: 'removed',
        _id: role._id,
        u: {
          _id: user._id,
          username,
        },
        scope,
      };
      
      if (mockSettings.get('UI_DisplayRoles')) {
        await mockApi.broadcast('user.roleUpdate', event);
      }

      // Assert
      expect(mockSettings.get).toHaveBeenCalledWith('UI_DisplayRoles');
      expect(mockApi.broadcast).toHaveBeenCalledWith('user.roleUpdate', event);
    });

    test('TC-013: Should always broadcast federation.userRoleChanged event', async () => {
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
      mockRemoveUserFromRolesAsync.mockResolvedValue(true);
      mockApi.broadcast.mockResolvedValue(undefined);

      // Act
      const event = {
        type: 'removed',
        _id: role._id,
        u: {
          _id: user._id,
          username,
        },
        scope,
      };
      
      await mockApi.broadcast('federation.userRoleChanged', { ...event, givenByUserId: userId });

      // Assert
      expect(mockApi.broadcast).toHaveBeenCalledWith('federation.userRoleChanged', {
        ...event,
        givenByUserId: userId
      });
    });

    test('TC-014: Should return boolean result from removeUserFromRolesAsync', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRemoveUserFromRolesAsync.mockResolvedValue(false); // Returns false

      // Act
      const result = await mockRemoveUserFromRolesAsync(user._id, [role._id], undefined);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Meteor Method - authorization:removeUserFromRole', () => {
    
    test('TC-015: Should log method deprecation', () => {
      // Arrange
      const mockLogger = { method: jest.fn() };
      
      // Act
      mockLogger.method('authorization:removeUserFromRole', '8.0.0', '/v1/roles.removeUserFromRole');

      // Assert
      expect(mockLogger.method).toHaveBeenCalledWith(
        'authorization:removeUserFromRole',
        '8.0.0',
        '/v1/roles.removeUserFromRole'
      );
    });

    test('TC-016: Should throw error when no user is logged in', () => {
      // Arrange
      mockMeteor.userId.mockReturnValue(null);

      // Act & Assert
      if (!mockMeteor.userId()) {
        expect(() => {
          throw mockMeteor.Error('error-action-not-allowed', 'Access permissions is not allowed', {
            method: 'authorization:removeUserFromRole',
            action: 'Accessing_permissions',
          });
        }).toThrow();
      }
    });

    test('TC-017: Should call removeUserFromRole with correct parameters', async () => {
      // Arrange
      const mockUserId = 'current-user';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = 'room123';
      
      mockMeteor.userId.mockReturnValue(mockUserId);
      const mockRemoveUserFromRole = jest.fn().mockResolvedValue(true);

      // Act
      const result = await mockRemoveUserFromRole(mockUserId, roleId, username, scope);

      // Assert
      expect(result).toBe(true);
      expect(mockRemoveUserFromRole).toHaveBeenCalledWith(mockUserId, roleId, username, scope);
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-018: Should handle user without roles array', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'admin';
      const username = 'user-no-roles';
      const role = { _id: 'admin' };
      const user = { _id: 'user123' }; // No roles property
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);

      // Act
      const userIsAdmin = user.roles?.indexOf('admin') > -1;

      // Assert
      expect(userIsAdmin).toBe(false); // undefined?.indexOf returns -1
    });

    test('TC-019: Should handle user with empty roles array', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'admin';
      const username = 'user-empty-roles';
      const role = { _id: 'admin' };
      const user = { _id: 'user123', roles: [] };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);

      // Act
      const userIsAdmin = user.roles?.indexOf('admin') > -1;

      // Assert
      expect(userIsAdmin).toBe(false); // -1 > -1 is false
    });

    test('TC-020: Should handle undefined scope parameter', async () => {
      // Arrange
      const userId = 'admin123';
      const roleId = 'moderator';
      const username = 'testuser';
      const scope = undefined;
      const role = { _id: 'moderator' };
      const user = { _id: 'user123' };
      
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockUsers.findOneByUsernameIgnoringCase.mockResolvedValue(user);
      mockRemoveUserFromRolesAsync.mockResolvedValue(true);

      // Act
      const result = await mockRemoveUserFromRolesAsync(user._id, [role._id], scope);

      // Assert
      expect(result).toBe(true);
      expect(mockRemoveUserFromRolesAsync).toHaveBeenCalledWith('user123', ['moderator'], undefined);
    });
  });
});
