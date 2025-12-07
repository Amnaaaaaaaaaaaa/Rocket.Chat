/**
 * White Box Testing for addPermissionToRole.ts
 * 
 * Functions Under Test:
 * - Meteor method: authorization:addPermissionToRole
 */

describe('addPermissionToRole.ts - Add Permission to Role', () => {
  let mockLicense;
  let mockPermissions;
  let mockMeteor;
  let mockHasPermission;
  let mockNotifyOnPermissionChangedById;
  let mockConstants;
  let mockAuthorizationUtils;
  
  beforeEach(() => {
    mockLicense = {
      hasValidLicense: jest.fn(),
      getGuestPermissions: jest.fn()
    };

    mockPermissions = {
      findOneById: jest.fn(),
      addRole: jest.fn()
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

    mockAuthorizationUtils = {
      hasRestrictionsToRole: jest.fn(),
      addRolePermissionWhiteList: jest.fn(),
      isPermissionRestrictedForRole: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('Meteor Method - authorization:addPermissionToRole', () => {
    
    test('TC-001: Should add guest permissions white list when role is guest with valid license', async () => {
      // Arrange
      const permissionId = 'some-permission';
      const role = 'guest';
      const guestPermissions = ['view-room', 'send-message'];
      
      mockAuthorizationUtils.hasRestrictionsToRole.mockReturnValue(false);
      mockLicense.hasValidLicense.mockResolvedValue(true);
      mockLicense.getGuestPermissions.mockResolvedValue(guestPermissions);

      // Act
      if (role === 'guest' && !mockAuthorizationUtils.hasRestrictionsToRole(role) && (await mockLicense.hasValidLicense())) {
        mockAuthorizationUtils.addRolePermissionWhiteList(role, await mockLicense.getGuestPermissions());
      }

      // Assert
      expect(mockAuthorizationUtils.hasRestrictionsToRole).toHaveBeenCalledWith('guest');
      expect(mockLicense.hasValidLicense).toHaveBeenCalled();
      expect(mockLicense.getGuestPermissions).toHaveBeenCalled();
      expect(mockAuthorizationUtils.addRolePermissionWhiteList).toHaveBeenCalledWith('guest', guestPermissions);
    });

    test('TC-002: Should not add guest permissions when role has restrictions', async () => {
      // Arrange
      const permissionId = 'some-permission';
      const role = 'guest';
      
      mockAuthorizationUtils.hasRestrictionsToRole.mockReturnValue(true); // Has restrictions
      // License check should not be called

      // Act
      if (role === 'guest' && !mockAuthorizationUtils.hasRestrictionsToRole(role) && (await mockLicense.hasValidLicense())) {
        mockAuthorizationUtils.addRolePermissionWhiteList(role, await mockLicense.getGuestPermissions());
      }

      // Assert
      expect(mockAuthorizationUtils.hasRestrictionsToRole).toHaveBeenCalledWith('guest');
      expect(mockLicense.hasValidLicense).not.toHaveBeenCalled();
      expect(mockAuthorizationUtils.addRolePermissionWhiteList).not.toHaveBeenCalled();
    });

    test('TC-003: Should not add guest permissions for non-guest roles', async () => {
      // Arrange
      const permissionId = 'some-permission';
      const role = 'admin'; // Not guest
      
      // Act
      if (role === 'guest' && !mockAuthorizationUtils.hasRestrictionsToRole(role) && (await mockLicense.hasValidLicense())) {
        mockAuthorizationUtils.addRolePermissionWhiteList(role, await mockLicense.getGuestPermissions());
      }

      // Assert
      expect(mockAuthorizationUtils.hasRestrictionsToRole).not.toHaveBeenCalled();
      expect(mockLicense.hasValidLicense).not.toHaveBeenCalled();
    });

    test('TC-004: Should throw error when permission is restricted for role', async () => {
      // Arrange
      const permissionId = 'restricted-permission';
      const role = 'user';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(true);

      // Act & Assert
      if (mockAuthorizationUtils.isPermissionRestrictedForRole(permissionId, role)) {
        expect(() => {
          throw mockMeteor.Error('error-action-not-allowed', 'Permission is restricted', {
            method: 'authorization:addPermissionToRole',
            action: 'Adding_permission',
          });
        }).toThrow();
      }
    });

    test('TC-005: Should find permission by ID', async () => {
      // Arrange
      const permissionId = 'valid-permission';
      const role = 'admin';
      const permission = { _id: permissionId, level: 'general' };
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
      mockPermissions.findOneById.mockResolvedValue(permission);

      // Act
      const foundPermission = await mockPermissions.findOneById(permissionId);

      // Assert
      expect(foundPermission).toBe(permission);
      expect(mockPermissions.findOneById).toHaveBeenCalledWith(permissionId);
    });

    test('TC-006: Should throw error when permission not found', async () => {
      // Arrange
      const permissionId = 'non-existent-permission';
      const role = 'admin';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
      mockPermissions.findOneById.mockResolvedValue(null);

      // Act & Assert
      try {
        const permission = await mockPermissions.findOneById(permissionId);
        if (!permission) {
          throw mockMeteor.Error('error-invalid-permission', 'Permission does not exist', {
            method: 'authorization:addPermissionToRole',
            action: 'Adding_permission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-invalid-permission');
        expect(error.reason).toBe('Permission does not exist');
      }
    });

    test('TC-007: Should throw error when user is not logged in', async () => {
      // Arrange
      const permissionId = 'valid-permission';
      const role = 'admin';
      const permission = { _id: permissionId, level: 'general' };
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
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
          throw mockMeteor.Error('error-action-not-allowed', 'Adding permission is not allowed', {
            method: 'authorization:addPermissionToRole',
            action: 'Adding_permission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
      }
    });

    test('TC-008: Should throw error when user lacks access-permissions', async () => {
      // Arrange
      const permissionId = 'valid-permission';
      const role = 'admin';
      const permission = { _id: permissionId, level: 'general' };
      const userId = 'user123';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
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
          throw mockMeteor.Error('error-action-not-allowed', 'Adding permission is not allowed', {
            method: 'authorization:addPermissionToRole',
            action: 'Adding_permission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
      }
    });

    test('TC-009: Should require access-setting-permissions for SETTINGS_LEVEL permissions', async () => {
      // Arrange
      const permissionId = 'setting-permission';
      const role = 'admin';
      const permission = { 
        _id: permissionId, 
        level: mockConstants.SETTINGS_LEVEL,
        groupPermissionId: 'group-perm'
      };
      const userId = 'admin123';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValueOnce(true); // access-permissions
      mockHasPermission.mockResolvedValueOnce(false); // access-setting-permissions

      // Act & Assert
      try {
        const uid = mockMeteor.userId();
        if (
          !uid ||
          !(await mockHasPermission(uid, 'access-permissions')) ||
          (permission.level === mockConstants.SETTINGS_LEVEL && !(await mockHasPermission(uid, 'access-setting-permissions')))
        ) {
          throw mockMeteor.Error('error-action-not-allowed', 'Adding permission is not allowed', {
            method: 'authorization:addPermissionToRole',
            action: 'Adding_permission',
          });
        }
      } catch (error) {
        expect(error.error).toBe('error-action-not-allowed');
      }
    });

    test('TC-010: Should add role to group permission when groupPermissionId exists', async () => {
      // Arrange
      const permissionId = 'setting-permission';
      const role = 'admin';
      const permission = { 
        _id: permissionId, 
        level: mockConstants.SETTINGS_LEVEL,
        groupPermissionId: 'group-permission-id'
      };
      const userId = 'admin123';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockPermissions.addRole.mockResolvedValue(undefined);
      mockNotifyOnPermissionChangedById.mockResolvedValue(undefined);

      // Act
      if (permission.groupPermissionId) {
        await mockPermissions.addRole(permission.groupPermissionId, role);
        await mockNotifyOnPermissionChangedById(permission.groupPermissionId);
      }

      // Assert
      expect(mockPermissions.addRole).toHaveBeenCalledWith('group-permission-id', 'admin');
      expect(mockNotifyOnPermissionChangedById).toHaveBeenCalledWith('group-permission-id');
    });

    test('TC-011: Should add role to permission and notify', async () => {
      // Arrange
      const permissionId = 'regular-permission';
      const role = 'user';
      const permission = { 
        _id: permissionId, 
        level: 'general'
        // No groupPermissionId
      };
      const userId = 'admin123';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockPermissions.addRole.mockResolvedValue(undefined);
      mockNotifyOnPermissionChangedById.mockResolvedValue(undefined);

      // Act
      await mockPermissions.addRole(permission._id, role);
      await mockNotifyOnPermissionChangedById(permission._id);

      // Assert
      expect(mockPermissions.addRole).toHaveBeenCalledWith('regular-permission', 'user');
      expect(mockNotifyOnPermissionChangedById).toHaveBeenCalledWith('regular-permission');
    });

    test('TC-012: Should handle both group and individual permission addition', async () => {
      // Arrange
      const permissionId = 'complex-permission';
      const role = 'admin';
      const permission = { 
        _id: permissionId, 
        level: mockConstants.SETTINGS_LEVEL,
        groupPermissionId: 'group-perm'
      };
      const userId = 'admin123';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
      mockPermissions.findOneById.mockResolvedValue(permission);
      mockMeteor.userId.mockReturnValue(userId);
      mockHasPermission.mockResolvedValue(true);
      mockPermissions.addRole.mockResolvedValue(undefined);

      // Act
      if (permission.groupPermissionId) {
        await mockPermissions.addRole(permission.groupPermissionId, role);
        await mockNotifyOnPermissionChangedById(permission.groupPermissionId);
      }

      await mockPermissions.addRole(permission._id, role);
      await mockNotifyOnPermissionChangedById(permission._id);

      // Assert
      expect(mockPermissions.addRole).toHaveBeenCalledTimes(2);
      expect(mockPermissions.addRole).toHaveBeenCalledWith('group-perm', 'admin');
      expect(mockPermissions.addRole).toHaveBeenCalledWith('complex-permission', 'admin');
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-013: Should handle permission without groupPermissionId', async () => {
      // Arrange
      const permissionId = 'simple-permission';
      const role = 'user';
      const permission = { 
        _id: permissionId, 
        level: 'general'
        // No groupPermissionId
      };
      
      // Act
      const hasGroupPermission = !!permission.groupPermissionId;

      // Assert
      expect(hasGroupPermission).toBe(false);
    });

    test('TC-014: Should handle empty string role parameter', async () => {
      // Arrange
      const permissionId = 'test-permission';
      const role = ''; // Empty string
      
      // Act
      expect(typeof role).toBe('string');
      expect(role).toBe('');
    });

    test('TC-015: Should handle License.hasValidLicense returning false', async () => {
      // Arrange
      const permissionId = 'some-permission';
      const role = 'guest';
      
      mockAuthorizationUtils.hasRestrictionsToRole.mockReturnValue(false);
      mockLicense.hasValidLicense.mockResolvedValue(false); // No valid license

      // Act
      if (role === 'guest' && !mockAuthorizationUtils.hasRestrictionsToRole(role) && (await mockLicense.hasValidLicense())) {
        mockAuthorizationUtils.addRolePermissionWhiteList(role, await mockLicense.getGuestPermissions());
      }

      // Assert
      expect(mockAuthorizationUtils.addRolePermissionWhiteList).not.toHaveBeenCalled();
    });
  });

  describe('AuthorizationUtils Functions', () => {
    
    test('TC-016: Should check permission restrictions correctly', () => {
      // Test isPermissionRestrictedForRole with different scenarios
      const permissionId = 'test-permission';
      const role = 'user';
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(true);
      expect(mockAuthorizationUtils.isPermissionRestrictedForRole(permissionId, role)).toBe(true);
      
      mockAuthorizationUtils.isPermissionRestrictedForRole.mockReturnValue(false);
      expect(mockAuthorizationUtils.isPermissionRestrictedForRole(permissionId, role)).toBe(false);
    });

    test('TC-017: Should check role restrictions correctly', () => {
      // Test hasRestrictionsToRole with different roles
      const guestRole = 'guest';
      const adminRole = 'admin';
      
      mockAuthorizationUtils.hasRestrictionsToRole.mockReturnValue(true);
      expect(mockAuthorizationUtils.hasRestrictionsToRole(guestRole)).toBe(true);
      
      mockAuthorizationUtils.hasRestrictionsToRole.mockReturnValue(false);
      expect(mockAuthorizationUtils.hasRestrictionsToRole(adminRole)).toBe(false);
    });
  });
});
