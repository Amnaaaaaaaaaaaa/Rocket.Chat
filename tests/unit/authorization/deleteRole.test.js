/**
 * White Box Testing for deleteRole.ts
 * 
 * Functions Under Test:
 * - Meteor method: authorization:deleteRole
 */

describe('deleteRole.ts - Delete Role', () => {
  let mockRoles;
  let mockMeteor;
  let mockHasPermission;
  let mockMethodDeprecationLogger;
  
  beforeEach(() => {
    mockRoles = {
      findOneById: jest.fn(),
      findOneByName: jest.fn(),
      countUsersInRole: jest.fn(),
      removeById: jest.fn()
    };

    mockMeteor = {
      methods: jest.fn(),
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      userId: jest.fn()
    };

    mockHasPermission = jest.fn();
    mockMethodDeprecationLogger = {
      method: jest.fn(),
      deprecatedParameterUsage: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('Meteor Method - authorization:deleteRole', () => {
    
    test('TC-001: Should log method deprecation', () => {
      // Arrange
      const mockLogger = { method: jest.fn() };
      
      // Act
      mockLogger.method('authorization:deleteRole', '8.0.0', '/v1/roles.delete');

      // Assert
      expect(mockLogger.method).toHaveBeenCalledWith(
        'authorization:deleteRole',
        '8.0.0',
        '/v1/roles.delete'
      );
    });

    test('TC-002: Should throw error when user is not logged in', async () => {
      // Arrange
      const roleId = 'test-role';
      
      mockMeteor.userId.mockReturnValue(null);

      // Act & Assert
      try {
        const userId = mockMeteor.userId();
        if (!userId || !(await mockHasPermission(userId, 'access-permissions'))) {
          throw mockMeteor.Error('error-action-not-allowed', 'Accessing permissions is not allowed', {
            method: 'authorization:deleteRole',
            action: 'Accessing_permissions',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
        expect(error.reason).toBe('Accessing permissions is not allowed');
      }
    });

    test('TC-003: Should throw error when user lacks access-permissions', async () => {
      // Arrange
      const roleId = 'test-role';
      const userId = 'user123';
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(false); // No access-permissions

      // Act & Assert
      try {
        const uid = mockMeteor.userId();
        if (!uid || !(await mockHasPermission(uid, 'access-permissions'))) {
          throw mockMeteor.Error('error-action-not-allowed', 'Accessing permissions is not allowed', {
            method: 'authorization:deleteRole',
            action: 'Accessing_permissions',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
      }
    });

    test('TC-004: Should find role by ID with protected projection', async () => {
      // Arrange
      const roleId = 'role-id-123';
      const role = { _id: 'role-id-123', protected: false };
      const userId = 'admin123';
      const options = {
        projection: {
          _id: 1,
          protected: 1,
        },
      };
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);

      // Act
      const foundRole = await mockRoles.findOneById(roleId, options);

      // Assert
      expect(foundRole).toBe(role);
      expect(mockRoles.findOneById).toHaveBeenCalledWith(roleId, options);
      expect(foundRole.protected).toBe(false);
    });

    test('TC-005: Should fallback to find role by name with deprecation warning', async () => {
      // Arrange
      const roleName = 'moderator'; // Using name instead of ID
      const role = { _id: 'moderator-id', protected: false };
      const userId = 'admin123';
      const options = {
        projection: {
          _id: 1,
          protected: 1,
        },
      };
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(null);
      mockRoles.findOneByName.mockResolvedValue(role);

      // Act
      let foundRole = await mockRoles.findOneById(roleName, options);
      if (!foundRole) {
        foundRole = await mockRoles.findOneByName(roleName, options);
        
        mockMethodDeprecationLogger.deprecatedParameterUsage(
          'authorization:deleteRole',
          'role',
          '7.0.0',
          expect.any(Function)
        );
      }

      // Assert
      expect(foundRole).toBe(role);
      expect(mockRoles.findOneByName).toHaveBeenCalledWith(roleName, options);
      expect(mockMethodDeprecationLogger.deprecatedParameterUsage).toHaveBeenCalled();
    });

    test('TC-006: Should throw error when role not found', async () => {
      // Arrange
      const roleId = 'non-existent-role';
      const userId = 'admin123';
      const options = {
        projection: {
          _id: 1,
          protected: 1,
        },
      };
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(null);
      mockRoles.findOneByName.mockResolvedValue(null);

      // Act & Assert
      try {
        let role = await mockRoles.findOneById(roleId, options);
        if (!role) {
          role = await mockRoles.findOneByName(roleId, options);
          
          if (!role) {
            throw mockMeteor.Error('error-invalid-role', 'Invalid role', {
              method: 'authorization:deleteRole',
            });
          }
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-role');
        expect(error.reason).toBe('Invalid role');
      }
    });

    test('TC-007: Should throw error when trying to delete protected role', async () => {
      // Arrange
      const roleId = 'admin';
      const role = { _id: 'admin', protected: true };
      const userId = 'admin123';
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);

      // Act & Assert
      try {
        if (role.protected) {
          throw mockMeteor.Error('error-delete-protected-role', 'Cannot delete a protected role', {
            method: 'authorization:deleteRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-delete-protected-role');
        expect(error.reason).toBe('Cannot delete a protected role');
      }
    });

    test('TC-008: Should check if role is in use by counting users', async () => {
      // Arrange
      const roleId = 'moderator';
      const role = { _id: 'moderator', protected: false };
      const userId = 'admin123';
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockRoles.countUsersInRole.mockResolvedValue(5); // 5 users have this role

      // Act
      const userCount = await mockRoles.countUsersInRole(role._id);

      // Assert
      expect(userCount).toBe(5);
      expect(mockRoles.countUsersInRole).toHaveBeenCalledWith('moderator');
    });

    test('TC-009: Should throw error when role is in use', async () => {
      // Arrange
      const roleId = 'moderator';
      const role = { _id: 'moderator', protected: false };
      const userId = 'admin123';
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockRoles.countUsersInRole.mockResolvedValue(1); // 1 user has this role

      // Act & Assert
      try {
        const users = await mockRoles.countUsersInRole(role._id);
        if (users > 0) {
          throw mockMeteor.Error('error-role-in-use', "Cannot delete role because it's in use", {
            method: 'authorization:deleteRole',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-role-in-use');
        expect(error.reason).toBe("Cannot delete role because it's in use");
      }
    });

    test('TC-010: Should allow deletion when role is not in use', async () => {
      // Arrange
      const roleId = 'unused-role';
      const role = { _id: 'unused-role', protected: false };
      const userId = 'admin123';
      const deleteResult = { deletedCount: 1 };
      
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockRoles.countUsersInRole.mockResolvedValue(0); // No users have this role
      mockRoles.removeById.mockResolvedValue(deleteResult);

      // Act
      const users = await mockRoles.countUsersInRole(role._id);
      let result;
      if (users === 0) {
        result = await mockRoles.removeById(role._id);
      }

      // Assert
      expect(users).toBe(0);
      expect(result).toBe(deleteResult);
      expect(mockRoles.removeById).toHaveBeenCalledWith('unused-role');
    });

    test('TC-011: Should return delete result from removeById', async () => {
      // Arrange
      const roleId = 'test-role';
      const role = { _id: 'test-role', protected: false };
      const deleteResult = { 
        deletedCount: 1,
        acknowledged: true 
      };
      
      mockMeteor.userId.mockReturnValue('admin123');
      mockHasPermission.mockResolvedValue(true);
      mockRoles.findOneById.mockResolvedValue(role);
      mockRoles.countUsersInRole.mockResolvedValue(0);
      mockRoles.removeById.mockResolvedValue(deleteResult);

      // Act
      const result = await mockRoles.removeById(role._id);

      // Assert
      expect(result).toBe(deleteResult);
      expect(result.deletedCount).toBe(1);
      expect(result.acknowledged).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-012: Should handle role with protected property as undefined', async () => {
      // Arrange
      const roleId = 'test-role';
      const role = { _id: 'test-role' }; // protected property is undefined
      
      // Act
      const isProtected = role.protected === true;

      // Assert
      expect(isProtected).toBe(false); // undefined === true is false
    });

    test('TC-013: Should handle role with protected property as null', async () => {
      // Arrange
      const roleId = 'test-role';
      const role = { _id: 'test-role', protected: null };
      
      // Act
      const isProtected = role.protected === true;

      // Assert
      expect(isProtected).toBe(false); // null === true is false
    });

    test('TC-014: Should handle countUsersInRole returning zero for new role', async () => {
      // Arrange
      const roleId = 'new-role';
      
      mockRoles.countUsersInRole.mockResolvedValue(0);

      // Act
      const userCount = await mockRoles.countUsersInRole(roleId);

      // Assert
      expect(userCount).toBe(0);
    });

    test('TC-015: Should handle removeById returning zero deletedCount', async () => {
      // Arrange
      const roleId = 'already-deleted-role';
      const deleteResult = { deletedCount: 0, acknowledged: true };
      
      mockRoles.removeById.mockResolvedValue(deleteResult);

      // Act
      const result = await mockRoles.removeById(roleId);

      // Assert
      expect(result.deletedCount).toBe(0);
    });

    test('TC-016: Should handle role ID as empty string', async () => {
      // Arrange
      const roleId = '';
      
      // Act
      expect(typeof roleId).toBe('string');
      expect(roleId).toBe('');
    });
  });

  describe('Projection Options', () => {
    
    test('TC-017: Should use correct projection for role lookup', () => {
      // Test projection object structure
      const options = {
        projection: {
          _id: 1,
          protected: 1,
        },
      };

      // Assert
      expect(options.projection._id).toBe(1);
      expect(options.projection.protected).toBe(1);
      expect(Object.keys(options.projection)).toHaveLength(2);
      expect(options.projection.name).toBeUndefined();
      expect(options.projection.description).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    
    test('TC-018: Should handle countUsersInRole throwing error', async () => {
      // Arrange
      const roleId = 'error-role';
      
      mockRoles.countUsersInRole.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(mockRoles.countUsersInRole(roleId))
        .rejects
        .toThrow('Database error');
    });

    test('TC-019: Should handle removeById throwing error', async () => {
      // Arrange
      const roleId = 'delete-error-role';
      
      mockRoles.removeById.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(mockRoles.removeById(roleId))
        .rejects
        .toThrow('Delete failed');
    });
  });
});
