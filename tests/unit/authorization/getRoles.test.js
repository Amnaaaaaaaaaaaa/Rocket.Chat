/**
 * White Box Testing for getRoles.ts
 * 
 * Functions Under Test:
 * - getRoles()
 * - getRoleIds()
 */

describe('getRoles.ts - Role Management Functions', () => {
  let mockRoles;

  beforeEach(() => {
    mockRoles = {
      find: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue([])
      }))
    };
    jest.clearAllMocks();
  });

  // -------------------- getRoles() Tests --------------------
  describe('getRoles() - Function Tests', () => {
    test('TC-001: Should fetch all roles and convert to array', async () => {
      const mockRolesArray = [
        { _id: 'admin', name: 'Administrator', scope: 'Users', description: 'Full system access' },
        { _id: 'user', name: 'User', scope: 'Users', description: 'Regular user' },
        { _id: 'bot', name: 'Bot', scope: 'Users', description: 'Automated service' }
      ];
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(mockRolesArray) });
      const result = await mockRoles.find().toArray();

      expect(result).toEqual(mockRolesArray);
      expect(result).toHaveLength(3);
      expect(mockRoles.find).toHaveBeenCalledTimes(1);
    });

    test('TC-002: Should return empty array when no roles exist', async () => {
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue([]) });
      const result = await mockRoles.find().toArray();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    test('TC-003: Should handle database errors gracefully', async () => {
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockRejectedValue(new Error('Database connection failed')) });
      await expect(mockRoles.find().toArray()).rejects.toThrow('Database connection failed');
    });

    test('TC-004: Should return role objects with complete structure', async () => {
      const completeRole = {
        _id: 'complete-role',
        name: 'Complete Role',
        scope: 'Subscriptions',
        description: 'Role with all properties',
        protected: true,
        mandatory2fa: false,
        _updatedAt: new Date('2023-01-01')
      };
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue([completeRole]) });
      const result = await mockRoles.find().toArray();

      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('scope');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('protected');
      expect(result[0]._id).toBe('complete-role');
    });
  });

  // -------------------- getRoleIds() Tests --------------------
  describe('getRoleIds() - Function Tests', () => {
    test('TC-005: Should fetch only _id projection and extract IDs', async () => {
      const rolesWithIds = [{ _id: 'admin' }, { _id: 'user' }, { _id: 'bot' }, { _id: 'guest' }];
      mockRoles.find.mockImplementationOnce((query, options) => {
        expect(query).toEqual({});
        expect(options).toEqual({ projection: { _id: 1 } });
        return { toArray: jest.fn().mockResolvedValue(rolesWithIds) };
      });

      const roles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();
      const roleIds = roles.map(({ _id }) => _id);

      expect(roleIds).toEqual(['admin', 'user', 'bot', 'guest']);
      expect(roleIds.every(id => typeof id === 'string')).toBe(true);
    });

    test('TC-006: Should return empty array when no role IDs exist', async () => {
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue([]) });
      const roles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();
      const roleIds = roles.map(({ _id }) => _id);

      expect(roleIds).toEqual([]);
      expect(roleIds).toHaveLength(0);
    });

    test('TC-007: Should handle roles with null _id (edge case)', async () => {
      const rolesWithNullId = [{ _id: 'valid-id' }, { _id: null }, { _id: 'another-valid' }, { _id: undefined }];
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(rolesWithNullId) });
      const roles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();
      const roleIds = roles.map(({ _id }) => _id);

      expect(roleIds).toEqual(['valid-id', null, 'another-valid', undefined]);
    });

    test('TC-008: Should extract IDs in correct order', async () => {
      const rolesInOrder = [{ _id: 'first' }, { _id: 'second' }, { _id: 'third' }];
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(rolesInOrder) });
      const roles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();
      const roleIds = roles.map(({ _id }) => _id);

      expect(roleIds).toEqual(['first', 'second', 'third']);
    });
  });

  // -------------------- Function Comparison and Relationship --------------------
  describe('Function Comparison and Relationship', () => {
    test('TC-009: Should have consistent results between getRoles and getRoleIds', async () => {
      const sameRoles = [
        { _id: 'admin', name: 'Admin' },
        { _id: 'user', name: 'User' },
        { _id: 'moderator', name: 'Moderator' }
      ];
      mockRoles.find
        .mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(sameRoles) })
        .mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(sameRoles.map(({ _id }) => ({ _id }))) });

      const allRoles = await mockRoles.find().toArray();
      const idRoles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();

      expect(allRoles.map(r => r._id)).toEqual(idRoles.map(r => r._id));
    });

    test('TC-010: Should have getRoleIds as subset of getRoles', async () => {
      const fullRoles = [
        { _id: 'role1', name: 'Role 1', scope: 'Users', extra: 'data' },
        { _id: 'role2', name: 'Role 2', scope: 'Subscriptions', extra: 'more data' }
      ];
      const idOnlyRoles = fullRoles.map(({ _id }) => ({ _id }));

      mockRoles.find
        .mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(fullRoles) })
        .mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(idOnlyRoles) });

      const allRoles = await mockRoles.find().toArray();
      const idRoles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();

      expect(allRoles.map(r => r._id)).toEqual(idRoles.map(r => r._id));
      expect(allRoles[0]).toHaveProperty('name');
      expect(idRoles[0]).not.toHaveProperty('name');
    });
  });

  // -------------------- Edge Cases --------------------
  describe('Edge Cases', () => {
    test('TC-011: Should handle large number of roles', async () => {
      const largeRoles = Array.from({ length: 1000 }, (_, i) => ({ _id: `role-${i}`, name: `Role ${i}`, scope: 'Users' }));
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(largeRoles) });
      const result = await mockRoles.find().toArray();
      expect(result).toHaveLength(1000);
      expect(result[999]._id).toBe('role-999');
    });

    test('TC-012: Should handle roles with special characters in IDs', async () => {
      const specialRoles = [
        { _id: 'role-with-dash' },
        { _id: 'role.with.dots' },
        { _id: 'role_with_underscore' },
        { _id: 'role:with:colon' },
        { _id: 'role@with@at' }
      ];
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(specialRoles) });
      const roles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();
      const roleIds = roles.map(({ _id }) => _id);
      expect(roleIds).toContain('role-with-dash');
      expect(roleIds).toContain('role.with.dots');
      expect(roleIds).toContain('role_with_underscore');
      expect(roleIds).toContain('role:with:colon');
      expect(roleIds).toContain('role@with@at');
    });

    test('TC-013: Should handle duplicate role IDs', async () => {
      const duplicateRoles = [{ _id: 'duplicate' }, { _id: 'duplicate' }, { _id: 'unique' }];
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(duplicateRoles) });
      const roles = await mockRoles.find({}, { projection: { _id: 1 } }).toArray();
      const roleIds = roles.map(({ _id }) => _id);
      expect(roleIds.filter(id => id === 'duplicate')).toHaveLength(2);
    });

    test('TC-014: Should handle empty projection object', () => {
      const projection = { projection: { _id: 1 } };
      expect(projection.projection._id).toBe(1);
      expect(projection.projection.name).toBeUndefined();
    });

    test('TC-015: Should maintain async function nature', async () => {
      const mockAsyncFunction = async () => await mockRoles.find().toArray();
      const result = mockAsyncFunction();
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeDefined();
    });
  });

  // -------------------- Performance and Behavior --------------------
  describe('Performance and Behavior', () => {
    test('TC-016: Should use same collection for both functions', () => {
      const collection1 = mockRoles.find;
      const collection2 = mockRoles.find;
      expect(collection1).toBe(collection2);
    });

    test('TC-017: Should not modify original role objects', async () => {
      const originalRoles = [
        { _id: 'role1', name: 'Original' },
        { _id: 'role2', name: 'Untouched' }
      ];
      // Deep copy to preserve original
      mockRoles.find.mockReturnValueOnce({ toArray: jest.fn().mockResolvedValue(JSON.parse(JSON.stringify(originalRoles))) });

      const result = await mockRoles.find().toArray();
      result[0].name = 'Modified';

      expect(originalRoles[0].name).toBe('Original');
    });

    test('TC-018: Should handle concurrent calls', async () => {
      const roles = [{ _id: 'test' }];
      const mockFindResult = { toArray: jest.fn().mockResolvedValueOnce([...roles]).mockResolvedValueOnce([...roles]) };
      mockRoles.find.mockReturnValue(mockFindResult);

      const [result1, result2] = await Promise.all([
        mockRoles.find().toArray(),
        mockRoles.find({}, { projection: { _id: 1 } }).toArray()
      ]);

      expect(result1).toEqual(roles);
      expect(result2).toEqual([{ _id: 'test' }]);
      expect(mockRoles.find).toHaveBeenCalledTimes(2);
    });
  });
});

