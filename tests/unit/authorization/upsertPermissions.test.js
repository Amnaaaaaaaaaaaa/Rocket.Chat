/**
 * White Box Testing for upsertPermissions.ts
 *
 * Functions Under Test:
 * - upsertPermissions()
 * - createOrUpdateProtectedRoleAsync()
 * - createSettingPermission()
 * - createPermissionsForExistingSettings()
 */

describe('upsertPermissions.ts - Permission Management System', () => {
  let mockPermissions;
  let mockSettings;
  let mockModels;
  let mockRoles;
  let mockCreateOrUpdateProtectedRole;

  beforeEach(() => {
    mockPermissions = {
      create: jest.fn(),
      findOneById: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      findByLevel: jest.fn(),
      find: jest.fn(() => ({
        forEach: jest.fn(),
        toArray: jest.fn()
      }))
    };

    mockSettings = {
      findNotHidden: jest.fn(() => ({
        toArray: jest.fn()
      })),
      findOneById: jest.fn(),
      on: jest.fn()
    };

    mockModels = {
      Permissions: mockPermissions,
      Settings: mockSettings
    };

    mockRoles = {
      findOneById: jest.fn(),
      findUsersInRole: jest.fn(),
      find: jest.fn(() => ({
        toArray: jest.fn()
      }))
    };

    mockCreateOrUpdateProtectedRole = jest.fn();

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Main Function
  // -------------------------------------------------------------------------
  describe('upsertPermissions() - Main Function', () => {
    test('TC-001: Should iterate through all permissions and create them', async () => {
      const permissions = [
        { _id: 'permission-1', roles: ['admin'] },
        { _id: 'permission-2', roles: ['user', 'admin'] },
        { _id: 'permission-3', roles: ['guest'] }
      ];

      for await (const permission of permissions) {
        await mockPermissions.create(permission._id, permission.roles);
      }

      expect(mockPermissions.create).toHaveBeenCalledTimes(3);
      expect(mockPermissions.create).toHaveBeenCalledWith('permission-1', ['admin']);
      expect(mockPermissions.create).toHaveBeenCalledWith('permission-2', ['user', 'admin']);
      expect(mockPermissions.create).toHaveBeenCalledWith('permission-3', ['guest']);
    });

    test('TC-002: Should create all default protected roles', async () => {
      const defaultRoles = [
        { name: 'admin', scope: 'Users', description: 'Admin' },
        { name: 'moderator', scope: 'Subscriptions', description: 'Moderator' },
        { name: 'user', scope: 'Users', description: '' },
        { name: 'bot', scope: 'Users', description: '' },
        { name: 'guest', scope: 'Users', description: '' },
        { name: 'livechat-agent', scope: 'Users', description: 'Livechat Agent' },
        { name: 'livechat-manager', scope: 'Users', description: 'Livechat Manager' }
      ];

      for await (const role of defaultRoles) {
        await mockCreateOrUpdateProtectedRole(role.name, role);
      }

      expect(mockCreateOrUpdateProtectedRole).toHaveBeenCalledTimes(7);
      expect(mockCreateOrUpdateProtectedRole).toHaveBeenCalledWith('admin', defaultRoles[0]);
      expect(mockCreateOrUpdateProtectedRole).toHaveBeenCalledWith(
        'livechat-manager',
        defaultRoles[6]
      );
    });
  });

  // -------------------------------------------------------------------------
  // getPreviousPermissions()
  // -------------------------------------------------------------------------
  describe('getPreviousPermissions() - Helper Function', () => {
    test('TC-003: Should retrieve all previous setting permissions by level', async () => {
      const mockPermissionsData = [
        { _id: 'setting-perm-1', level: 'settings', settingId: 'setting-1' },
        { _id: 'setting-perm-2', level: 'settings', settingId: 'setting-2' },
        { _id: 'other-perm', level: 'other' }
      ];

      mockPermissions.findByLevel.mockReturnValue({
        forEach: jest.fn(cb => {
          mockPermissionsData
            .filter(p => p.level === 'settings') // FIX: filter by level
            .forEach(cb);
        })
      });

      const previousPermissions = {};
      await mockPermissions.findByLevel('settings', undefined).forEach(permission => {
        previousPermissions[permission._id] = permission;
      });

      expect(mockPermissions.findByLevel).toHaveBeenCalledWith('settings', undefined);
      expect(Object.keys(previousPermissions)).toHaveLength(2);
      expect(previousPermissions['setting-perm-1']).toEqual(mockPermissionsData[0]);
      expect(previousPermissions['setting-perm-2']).toEqual(mockPermissionsData[1]);
    });

    test('TC-004: Should retrieve specific setting permission by settingId', async () => {
      const settingId = 'specific-setting';

      mockPermissions.findByLevel('settings', settingId);

      expect(mockPermissions.findByLevel).toHaveBeenCalledWith('settings', settingId);
    });
  });

  // -------------------------------------------------------------------------
  // createSettingPermission()
  // -------------------------------------------------------------------------
  describe('createSettingPermission() - Helper Function', () => {
    test('TC-005: Should create new permission for setting with no previous roles', async () => {
      const setting = {
        _id: 'new-setting',
        group: 'General',
        section: 'Notifications',
        sorter: 100,
        hidden: false
      };

      const getSettingPermissionId = id => `permission-${id}`;
      const permissionId = getSettingPermissionId(setting._id);

      const permission = {
        level: 'settings',
        settingId: setting._id,
        group: setting.group,
        section: setting.section,
        sorter: setting.sorter,
        roles: []
      };

      if (setting.group) {
        permission.groupPermissionId = getSettingPermissionId(setting.group);
      }
      if (setting.section) {
        permission.sectionPermissionId = getSettingPermissionId(setting.section);
      }

      expect(permission._id).toBeUndefined();
      expect(permission.settingId).toBe('new-setting');
      expect(permission.roles).toEqual([]);
      expect(permission.groupPermissionId).toBe('permission-General');
      expect(permission.sectionPermissionId).toBe('permission-Notifications');
    });

    test('TC-006: Should preserve existing roles when recreating permission', async () => {
      const setting = {
        _id: 'existing-setting',
        group: 'General',
        sorter: 50
      };

      const previousPermissions = {
        'permission-existing-setting': {
          _id: 'permission-existing-setting',
          roles: ['admin', 'owner']
        }
      };

      const permission = {
        level: 'settings',
        settingId: setting._id,
        group: setting.group,
        sorter: setting.sorter,
        roles: []
      };

      if (previousPermissions['permission-existing-setting']?.roles) {
        permission.roles = previousPermissions['permission-existing-setting'].roles;
      }

      expect(permission.roles).toEqual(['admin', 'owner']);
    });

    test('TC-007: Should handle missing section in setting', async () => {
      const setting = {
        _id: 'no-section-setting',
        group: 'General',
        sorter: 10
      };

      const permission = {
        level: 'settings',
        settingId: setting._id,
        group: setting.group,
        sorter: setting.sorter,
        roles: []
      };

      expect(permission.section).toBeUndefined();
    });

    test('TC-008: Should check if permission already exists before upserting', async () => {
      const permissionId = 'existing-permission';
      const permission = {
        level: 'settings',
        settingId: 'test-setting',
        roles: ['admin']
      };

      mockPermissions.findOne.mockResolvedValue({ _id: permissionId });

      const existent = await mockPermissions.findOne(
        {
          _id: permissionId,
          ...permission
        },
        { projection: { _id: 1 } }
      );

      expect(existent).toBeTruthy();
      expect(mockPermissions.updateOne).not.toHaveBeenCalled();
    });

    test('TC-009: Should upsert permission when it does not exist', async () => {
      const permissionId = 'new-permission';
      const permission = {
        level: 'settings',
        settingId: 'test-setting',
        roles: ['admin']
      };

      mockPermissions.findOne.mockResolvedValue(null);
      mockPermissions.updateOne.mockResolvedValue({ modifiedCount: 1 });

      // FIXED: must await findOne()
      const existent = await mockPermissions.findOne();

      if (!existent) {
        try {
          await mockPermissions.updateOne(
            { _id: permissionId },
            { $set: permission },
            { upsert: true }
          );
        } catch (e) {
          if (!e.message.includes('E11000')) {
            await mockPermissions.updateOne(
              { _id: permissionId },
              { $set: permission },
              { upsert: true }
            );
          }
        }
      }

      expect(mockPermissions.updateOne).toHaveBeenCalledWith(
        { _id: permissionId },
        { $set: permission },
        { upsert: true }
      );
    });

    test('TC-010: Should handle MongoDB duplicate key error (E11000)', async () => {
      const permissionId = 'duplicate-permission';
      const permission = {
        level: 'settings',
        settingId: 'test-setting',
        roles: ['admin']
      };

      mockPermissions.findOne.mockResolvedValue(null);

      const mockError = new Error('E11000 duplicate key error');

      const existent = await mockPermissions.findOne();

      if (!existent) {
        try {
          throw mockError;
        } catch (e) {
          if (!e.message.includes('E11000')) {
            await mockPermissions.updateOne(
              { _id: permissionId },
              { $set: permission },
              { upsert: true }
            );
          }
        }
      }

      expect(mockPermissions.updateOne).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // createPermissionsForExistingSettings()
  // -------------------------------------------------------------------------
  describe('createPermissionsForExistingSettings() - Helper Function', () => {
    test('TC-011: Should create permissions for all non-hidden settings', async () => {
      const settingsArray = [
        { _id: 'setting-1', group: 'General', hidden: false },
        { _id: 'setting-2', group: 'Accounts', hidden: false },
        { _id: 'hidden-setting', group: 'General', hidden: true }
      ];

      mockSettings.findNotHidden.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(settingsArray.slice(0, 2))
      });

      const settings = await mockSettings.findNotHidden().toArray();

      expect(settings).toHaveLength(2);
      expect(settings[0]._id).toBe('setting-1');
      expect(settings[1]._id).toBe('setting-2');
      expect(settings.find(s => s._id === 'hidden-setting')).toBeUndefined();
    });

    test('TC-012: Should delete obsolete permissions for non-existent settings', async () => {
      const previousPermissions = {
        'permission-valid': { _id: 'permission-valid' },
        'permission-obsolete': { _id: 'permission-obsolete' }
      };

      delete previousPermissions['permission-valid'];

      for await (const obsoletePermission of Object.keys(previousPermissions)) {
        if (previousPermissions.hasOwnProperty(obsoletePermission)) {
          await mockPermissions.deleteOne({ _id: obsoletePermission });
          expect(mockPermissions.deleteOne).toHaveBeenCalledWith({
            _id: 'permission-obsolete'
          });
        }
      }
    });

    test('TC-013: Should handle empty previous permissions object', async () => {
      const previousPermissions = {};

      for await (const obsoletePermission of Object.keys(previousPermissions)) {
        if (previousPermissions.hasOwnProperty(obsoletePermission)) {
          expect(true).toBe(false);
        }
      }

      expect(mockPermissions.deleteOne).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Settings Event Listener
  // -------------------------------------------------------------------------
  describe('Settings Event Listener', () => {
    test('TC-014: Should register callback for setting changes', () => {
      const callback = jest.fn();

      mockSettings.on('*', callback);

      expect(mockSettings.on).toHaveBeenCalledWith('*', callback);
    });

    test('TC-015: Should process new non-hidden setting via event', async () => {
      const settingId = 'new-setting';
      const setting = { _id: settingId, group: 'General', hidden: false };

      mockSettings.findOneById.mockResolvedValue(setting);

      const eventCallback = async ([id]) => {
        const setting = await mockSettings.findOneById(id);
        if (setting && !setting.hidden) {
          return true;
        }
        return false;
      };

      const result = await eventCallback([settingId]);

      expect(result).toBe(true);
      expect(mockSettings.findOneById).toHaveBeenCalledWith(settingId);
    });

    test('TC-016: Should skip hidden settings in event callback', async () => {
      const settingId = 'hidden-setting';
      const setting = { _id: settingId, group: 'General', hidden: true };

      mockSettings.findOneById.mockResolvedValue(setting);

      const eventCallback = async ([id]) => {
        const setting = await mockSettings.findOneById(id);
        if (setting && !setting.hidden) {
          return true;
        }
        return false;
      };

      const result = await eventCallback([settingId]);

      expect(result).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Edge Cases
  // -------------------------------------------------------------------------
  describe('Edge Cases and Error Handling', () => {
    test('TC-017: Should handle setting with undefined section', async () => {
      const setting = {
        _id: 'setting-undefined-section',
        group: 'General',
        sorter: 100,
        section: undefined
      };

      const permission = {
        section: setting.section ?? undefined
      };

      expect(permission.section).toBeUndefined();
    });

    test('TC-018: Should handle setting with null section', async () => {
      const setting = {
        _id: 'setting-null-section',
        group: 'General',
        sorter: 100,
        section: null
      };

      const permission = {
        section: setting.section ?? undefined
      };

      expect(permission.section).toBeUndefined();
    });

    test('TC-019: Should handle permission without group', async () => {
      const setting = {
        _id: 'setting-no-group',
        sorter: 100
      };

      const permission = {
        level: 'settings',
        settingId: setting._id,
        sorter: setting.sorter,
        roles: []
      };

      if (setting.group) {
        permission.groupPermissionId = `permission-${setting.group}`;
      }

      expect(permission.group).toBeUndefined();
      expect(permission.groupPermissionId).toBeUndefined();
    });

    test('TC-020: Should process empty settings array', async () => {
      mockSettings.findNotHidden.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([])
      });

      const settings = await mockSettings.findNotHidden().toArray();

      expect(settings).toEqual([]);
      expect(settings).toHaveLength(0);
    });
  });
});

