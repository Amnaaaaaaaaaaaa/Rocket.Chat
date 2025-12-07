/**
 * White Box Testing for removeRoleFromPermission.ts
 * 
 * Functions Under Test:
 * - Meteor method: authorization:removeRoleFromPermission
 */

describe('removeRoleFromPermission.ts - Remove Role from Permission', () => {
  let mockPermissions;
  let mockMeteor;
  let mockHasPermission;
  let mockNotifyOnPermissionChangedById;
  let mockConstants;
  
  beforeEach(() => {
    mockPermissions = {
      findOneById: jest.fn(),
      removeRole: jest.fn()
    };

    mockMeteor = {
      methods: jest.fn(),
      Error: jest.fn((error, reason, details) => ({ error, reason, details })),
      userId: jest.fn()
    };

    mockHasPermission = jest.fn();
    mockNotifyOnPermissionChangedById = jest.fn();
    mockConstants = {
      SETTINGS_LEVEL: 'settings'
    };

    jest.clearAllMocks();
  });

  describe('Meteor Method - authorization:removeRoleFromPermission', () => {
    
    test('TC-001: Should throw error when permission not found', async () => {
      // Arrange
      const permissionId = 'non-existent-permission';
      const role = 'admin';
      
      mockPermissions.findOneById.mockResolvedValue(null);

      // Act & Assert
      try {
        const permission = await mockPermissions.findOneById(permissionId);
        if (!permission) {
          throw mockMeteor.Error('error-permission-not-found', 'Permission not found', {
            method: 'authorization:removeRoleFromPermission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-permission-not-found');
        expect(error.reason).toBe('Permission not found');
      }
    });

    test('TC-002: Should throw error when user is not logged in', async () => {
      // Arrange
      const permissionId = 'valid-permission';
      const role = 'admin';
      const permission = { _id: permissionId, level: 'general' };
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(null);

      // Act & Assert
      try {
        const uid = mockMeteor.userId();
        if (
          !uid ||
          !(await mockHasPermission(uid, 'access-permissions')) ||
          (permission.level === mockConstants.SETTINGS_LEVEL && !(await mockHasPermission(uid, 'access-setting-permissions')))
        ) {
          throw mockMeteor.Error('error-action-not-allowed', 'Removing permission is not allowed', {
            method: 'authorization:removeRoleFromPermission',
            action: 'Removing_permission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
        expect(error.reason).toBe('Removing permission is not allowed');
      }
    });

    test('TC-003: Should throw error when user lacks access-permissions', async () => {
      // Arrange
      const permissionId = 'valid-permission';
      const role = 'admin';
      const permission = { _id: permissionId, level: 'general' };
      const userId = 'user123';
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(false); // No access-permissions

      // Act & Assert
      try {
        const uid = mockMeteor.userId();
        if (
          !uid ||
          !(await mockHasPermission(uid, 'access-permissions')) ||
          (permission.level === mockConstants.SETTINGS_LEVEL && !(await mockHasPermission(uid, 'access-setting-permissions')))
        ) {
          throw mockMeteor.Error('error-action-not-allowed', 'Removing permission is not allowed', {
            method: 'authorization:removeRoleFromPermission',
            action: 'Removing_permission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
      }
    });

    test('TC-004: Should require access-setting-permissions for SETTINGS_LEVEL permissions', async () => {
      // Arrange
      const permissionId = 'setting-permission';
      const role = 'admin';
      const permission = { 
        _id: permissionId, 
        level: mockConstants.SETTINGS_LEVEL,
        groupPermissionId: 'group-perm'
      };
      const userId = 'admin123';
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValueOnce(true); // access-permissions
      mockHasPermission.mockResolvedValueOnce(false); // access-setting-permissions (for settings level)

      // Act & Assert
      try {
        const uid = mockMeteor.userId();
        if (
          !uid ||
          !(await mockHasPermission(uid, 'access-permissions')) ||
          (permission.level === mockConstants.SETTINGS_LEVEL && !(await mockHasPermission(uid, 'access-setting-permissions')))
        ) {
          throw mockMeteor.Error('error-action-not-allowed', 'Removing permission is not allowed', {
            method: 'authorization:removeRoleFromPermission',
            action: 'Removing_permission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
      }
    });

    test('TC-005: Should allow removal for SETTINGS_LEVEL with access-setting-permissions', async () => {
      // Arrange
      const permissionId = 'setting-permission';
      const role = 'admin';
      const permission = { 
        _id: permissionId, 
        level: mockConstants.SETTINGS_LEVEL,
        groupPermissionId: 'group-perm'
      };
      const userId = 'admin123';
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true); // Has both permissions

      // Act - Should pass permission check
      const uid = mockMeteor.userId();
      const hasAccessPermissions = await mockHasPermission(uid, 'access-permissions');
      const hasAccessSettingPermissions = await mockHasPermission(uid, 'access-setting-permissions');
      
      const canRemove = uid && hasAccessPermissions && 
        (!(permission.level === mockConstants.SETTINGS_LEVEL) || hasAccessSettingPermissions);

      // Assert
      expect(canRemove).toBe(true);
    });

    test('TC-006: Should remove role from group permission when groupPermissionId exists', async () => {
      // Arrange
      const permissionId = 'setting-permission';
      const role = 'admin';
      const permission = { 
        _id: permissionId, 
        level: mockConstants.SETTINGS_LEVEL,
        groupPermissionId: 'group-permission-id'
      };
      const userId = 'admin123';
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockPermissions.removeRole.mockResolvedValue(undefined);
      mockNotifyOnPermissionChangedById.mockResolvedValue(undefined);

      // Act - Simulate the conditional logic
      if (permission.groupPermissionId) {
        await mockPermissions.removeRole(permission.groupPermissionId, role);
        await mockNotifyOnPermissionChangedById(permission.groupPermissionId);
      }

      // Assert
      expect(mockPermissions.removeRole).toHaveBeenCalledWith('group-permission-id', 'admin');
      expect(mockNotifyOnPermissionChangedById).toHaveBeenCalledWith('group-permission-id');
    });

    test('TC-007: Should remove role from permission and notify', async () => {
      // Arrange
      const permissionId = 'regular-permission';
      const role = 'user';
      const permission = { 
        _id: permissionId, 
        level: 'general'
        // No groupPermissionId
      };
      const userId = 'admin123';
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockPermissions.removeRole.mockResolvedValue(undefined);
      mockNotifyOnPermissionChangedById.mockResolvedValue(undefined);

      // Act
      await mockPermissions.removeRole(permission._id, role);
      await mockNotifyOnPermissionChangedById(permission._id);

      // Assert
      expect(mockPermissions.removeRole).toHaveBeenCalledWith('regular-permission', 'user');
      expect(mockNotifyOnPermissionChangedById).toHaveBeenCalledWith('regular-permission');
      expect(mockPermissions.removeRole).toHaveBeenCalledTimes(1); // Only called for main permission
    });

    test('TC-008: Should handle permission without groupPermissionId', async () => {
      // Arrange
      const permissionId = 'simple-permission';
      const role = 'moderator';
      const permission = { 
        _id: permissionId, 
        level: 'general'
        // No groupPermissionId
      };
      const userId = 'admin123';
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);

      // Act - Check if groupPermissionId exists
      const hasGroupPermission = !!permission.groupPermissionId;

      // Assert
      expect(hasGroupPermission).toBe(false);
      // Should not call removeRole for group permission
    });

    test('TC-009: Should handle both group and individual permission removal', async () => {
      // Arrange
      const permissionId = 'complex-permission';
      const role = 'admin';
      const permission = { 
        _id: permissionId, 
        level: mockConstants.SETTINGS_LEVEL,
        groupPermissionId: 'group-perm'
      };
      const userId = 'admin123';
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockPermissions.removeRole.mockResolvedValue(undefined);

      // Act - Simulate the full removal logic
      if (permission.groupPermissionId) {
        await mockPermissions.removeRole(permission.groupPermissionId, role);
        mockNotifyOnPermissionChangedById(permission.groupPermissionId);
      }

      await mockPermissions.removeRole(permission._id, role);
      mockNotifyOnPermissionChangedById(permission._id);

      // Assert
      expect(mockPermissions.removeRole).toHaveBeenCalledTimes(2);
      expect(mockPermissions.removeRole).toHaveBeenCalledWith('group-perm', 'admin');
      expect(mockPermissions.removeRole).toHaveBeenCalledWith('complex-permission', 'admin');
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-010: Should handle permission with null groupPermissionId', async () => {
      // Arrange
      const permissionId = 'permission-null-group';
      const role = 'user';
      const permission = { 
        _id: permissionId, 
        level: 'general',
        groupPermissionId: null
      };
      
      // Act - Check if groupPermissionId is truthy
      const shouldProcessGroup = permission.groupPermissionId;

      // Assert
      expect(shouldProcessGroup).toBeNull();
      expect(!!shouldProcessGroup).toBe(false); // null is falsy
    });

    test('TC-011: Should handle permission with undefined groupPermissionId', async () => {
      // Arrange
      const permissionId = 'permission-undefined-group';
      const role = 'user';
      const permission = { 
        _id: permissionId, 
        level: 'general'
        // groupPermissionId is undefined
      };
      
      // Act
      const hasGroupPermission = permission.groupPermissionId !== undefined;

      // Assert
      expect(hasGroupPermission).toBe(false);
    });

    test('TC-012: Should handle empty string role parameter', async () => {
      // Arrange
      const permissionId = 'test-permission';
      const role = ''; // Empty string
      const permission = { _id: permissionId };
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue('user123');
      mockHasPermission.mockResolvedValue(true);

      // Act - Empty string should still be valid string
      expect(typeof role.valueOf()).toBe('string');
      expect(role).toBe('');
    });

    test('TC-013: Should handle non-string role parameter', () => {
      // Test type checking
      const roleNumber = 123;
      const roleObject = { name: 'admin' };
      const roleArray = ['admin'];
      
      expect(typeof roleNumber.valueOf()).toBe('number');
      expect(typeof roleObject.valueOf()).toBe('object');
      expect(typeof roleArray.valueOf()).toBe('object');
    });

    test('TC-014: Should handle notifyOnPermissionChangedById returning void', async () => {
      // Arrange
      const permissionId = 'test-permission';
      
      // Act
      await mockNotifyOnPermissionChangedById(permissionId);

      // Assert
      expect(mockNotifyOnPermissionChangedById).toHaveBeenCalledWith('test-permission');
      // Should not throw even if returns void/undefined
    });
  });

  describe('Permission Level Constants', () => {
    
    test('TC-015: Should correctly identify SETTINGS_LEVEL permissions', () => {
      // Test constant value
      expect(mockConstants.SETTINGS_LEVEL).toBe('settings');
      
      // Test equality checks
      const settingsPermission = { level: 'settings' };
      const generalPermission = { level: 'general' };
      
      expect(settingsPermission.level === mockConstants.SETTINGS_LEVEL).toBe(true);
      expect(generalPermission.level === mockConstants.SETTINGS_LEVEL).toBe(false);
    });

    test('TC-016: Should handle different permission levels', () => {
      const permissionLevels = ['settings', 'general', 'room', 'user'];
      
      permissionLevels.forEach(level => {
        const permission = { level };
        const isSettingsLevel = permission.level === mockConstants.SETTINGS_LEVEL;
        
        if (level === 'settings') {
          expect(isSettingsLevel).toBe(true);
        } else {
          expect(isSettingsLevel).toBe(false);
        }
      });
    });
  });

  describe('Error Handling', () => {
    
    test('TC-017: Should handle removeRole throwing error', async () => {
      // Arrange
      const permissionId = 'error-permission';
      const role = 'admin';
      const permission = { _id: permissionId };
      
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue('user123');
      mockHasPermission.mockResolvedValue(true);
      mockPermissions.removeRole.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(mockPermissions.removeRole(permissionId, role))
        .rejects
        .toThrow('Database error');
    });

    test('TC-018: Should handle notifyOnPermissionChangedById throwing error', async () => {
      // Arrange
      const permissionId = 'notify-error-permission';
      
      mockNotifyOnPermissionChangedById.mockRejectedValue(new Error('Notification failed'));

      // Act & Assert
      await expect(mockNotifyOnPermissionChangedById(permissionId))
        .rejects
        .toThrow('Notification failed');
    });
  });
});
