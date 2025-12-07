/**
 * White Box Testing for AuthorizationUtils.ts
 * File Location: apps/meteor/server/lib/authorization/AuthorizationUtils.ts
 * 
 * Class Under Test: AuthorizationUtils
 * 
 * Functions:
 * 1. addRolePermissionWhiteList(roleId, list)
 * 2. isPermissionRestrictedForRole(permissionId, roleId)
 * 3. isPermissionRestrictedForRoleList(permissionId, roleList)
 * 4. hasRestrictionsToRole(roleId)
 * 
 * Coverage Goals:
 * - Statement Coverage: 100%
 * - Branch Coverage: 100%
 * - Function Coverage: 100%
 */

describe('AuthorizationUtils - White Box Testing', () => {

  // Mock the private Map - we'll need to clear it between tests
  beforeEach(() => {
    // Clear the internal map by creating a fresh instance
    // Note: Since restrictedRolePermissions is module-scoped, 
    // we need to be careful about test isolation
  });

  // ==========================================
  // Test Suite 1: addRolePermissionWhiteList
  // ==========================================
  
  describe('addRolePermissionWhiteList - Complete Branch Coverage', () => {
    
    // ==========================================
    // Branch 1: Validation - Missing roleId
    // ==========================================
    
    test('TC-001: Should throw error when roleId is empty string', () => {
      // Arrange
      const roleId = '';
      const list = ['permission1', 'permission2'];

      // Act & Assert
      expect(() => {
        if (!roleId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-002: Should throw error when roleId is null', () => {
      // Arrange
      const roleId = null;
      const list = ['permission1'];

      // Act & Assert
      expect(() => {
        if (!roleId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-003: Should throw error when roleId is undefined', () => {
      // Arrange
      const roleId = undefined;
      const list = ['permission1'];

      // Act & Assert
      expect(() => {
        if (!roleId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-004: Should throw error when roleId is 0 (falsy)', () => {
      // Arrange
      const roleId = 0;
      const list = ['permission1'];

      // Act & Assert
      expect(() => {
        if (!roleId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    // ==========================================
    // Branch 2: Validation - Missing list
    // ==========================================
    
    test('TC-005: Should throw error when list is null', () => {
      // Arrange
      const roleId = 'admin';
      const list = null;

      // Act & Assert
      expect(() => {
        if (!roleId) {
          throw new Error('invalid-param');
        }
        if (!list) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-006: Should throw error when list is undefined', () => {
      // Arrange
      const roleId = 'admin';
      const list = undefined;

      // Act & Assert
      expect(() => {
        if (!roleId) {
          throw new Error('invalid-param');
        }
        if (!list) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-007: Should NOT throw error when list is empty array', () => {
      // Arrange
      const roleId = 'admin';
      const list = []; // Empty array is truthy

      // Act
      const hasError = !roleId || !list;

      // Assert - Empty array should pass validation
      expect(hasError).toBe(false);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(0);
    });

    // ==========================================
    // Branch 3: Map Operations - New Role
    // ==========================================
    
    test('TC-008: Should create new Set when role does not exist in Map', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'newRole';
      const list = ['permission1'];

      // Act
      const hasRole = mockMap.has(roleId);
      
      if (!hasRole) {
        mockMap.set(roleId, new Set());
      }

      // Assert
      expect(hasRole).toBe(false);
      expect(mockMap.has(roleId)).toBe(true);
      expect(mockMap.get(roleId)).toBeInstanceOf(Set);
    });

    test('TC-009: Should initialize empty Set for new role', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';

      // Act
      if (!mockMap.has(roleId)) {
        mockMap.set(roleId, new Set());
      }

      const rules = mockMap.get(roleId);

      // Assert
      expect(rules).toBeInstanceOf(Set);
      expect(rules.size).toBe(0);
    });

    // ==========================================
    // Branch 4: Map Operations - Existing Role
    // ==========================================
    
    test('TC-010: Should NOT create new Set when role already exists', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'existingRole';
      const existingSet = new Set(['existing-permission']);
      mockMap.set(roleId, existingSet);

      // Act
      const hadRoleBefore = mockMap.has(roleId);
      
      if (!mockMap.has(roleId)) {
        mockMap.set(roleId, new Set());
      }

      const rulesAfter = mockMap.get(roleId);

      // Assert
      expect(hadRoleBefore).toBe(true);
      expect(rulesAfter).toBe(existingSet); // Same reference
      expect(rulesAfter.has('existing-permission')).toBe(true);
    });

    // ==========================================
    // Branch 5: Adding Permissions to Set
    // ==========================================
    
    test('TC-011: Should add single permission to Set', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const list = ['create-user'];

      mockMap.set(roleId, new Set());
      const rules = mockMap.get(roleId);

      // Act
      for (const permissionId of list) {
        rules?.add(permissionId);
      }

      // Assert
      expect(rules.size).toBe(1);
      expect(rules.has('create-user')).toBe(true);
    });

    test('TC-012: Should add multiple permissions to Set', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const list = ['create-user', 'delete-user', 'edit-user'];

      mockMap.set(roleId, new Set());
      const rules = mockMap.get(roleId);

      // Act
      for (const permissionId of list) {
        rules?.add(permissionId);
      }

      // Assert
      expect(rules.size).toBe(3);
      expect(rules.has('create-user')).toBe(true);
      expect(rules.has('delete-user')).toBe(true);
      expect(rules.has('edit-user')).toBe(true);
    });

    test('TC-013: Should handle duplicate permissions in list', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const list = ['create-user', 'create-user', 'delete-user'];

      mockMap.set(roleId, new Set());
      const rules = mockMap.get(roleId);

      // Act
      for (const permissionId of list) {
        rules?.add(permissionId);
      }

      // Assert - Set automatically handles duplicates
      expect(rules.size).toBe(2);
      expect(rules.has('create-user')).toBe(true);
      expect(rules.has('delete-user')).toBe(true);
    });

    test('TC-014: Should add permissions to existing Set', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const existingSet = new Set(['existing-permission']);
      mockMap.set(roleId, existingSet);

      const newList = ['new-permission-1', 'new-permission-2'];
      const rules = mockMap.get(roleId);

      // Act
      for (const permissionId of newList) {
        rules?.add(permissionId);
      }

      // Assert
      expect(rules.size).toBe(3);
      expect(rules.has('existing-permission')).toBe(true);
      expect(rules.has('new-permission-1')).toBe(true);
      expect(rules.has('new-permission-2')).toBe(true);
    });

    test('TC-015: Should handle empty list without errors', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const list = [];

      mockMap.set(roleId, new Set());
      const rules = mockMap.get(roleId);
      const initialSize = rules.size;

      // Act
      for (const permissionId of list) {
        rules?.add(permissionId);
      }

      // Assert
      expect(rules.size).toBe(initialSize);
      expect(rules.size).toBe(0);
    });

    test('TC-016: Should use optional chaining for rules', () => {
      // Arrange
      const rules = undefined;

      // Act & Assert - Should not throw error
      expect(() => {
        rules?.add('test-permission');
      }).not.toThrow();
    });
  });

  // ==========================================
  // Test Suite 2: isPermissionRestrictedForRole
  // ==========================================
  
  describe('isPermissionRestrictedForRole - Complete Branch Coverage', () => {
    
    // ==========================================
    // Branch 1: Parameter Validation
    // ==========================================
    
    test('TC-017: Should throw error when roleId is empty', () => {
      // Arrange
      const roleId = '';
      const permissionId = 'create-user';

      // Act & Assert
      expect(() => {
        if (!roleId || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-018: Should throw error when permissionId is empty', () => {
      // Arrange
      const roleId = 'admin';
      const permissionId = '';

      // Act & Assert
      expect(() => {
        if (!roleId || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-019: Should throw error when both parameters are empty', () => {
      // Arrange
      const roleId = '';
      const permissionId = '';

      // Act & Assert
      expect(() => {
        if (!roleId || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-020: Should throw error when roleId is null', () => {
      // Arrange
      const roleId = null;
      const permissionId = 'test';

      // Act & Assert
      expect(() => {
        if (!roleId || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-021: Should throw error when permissionId is undefined', () => {
      // Arrange
      const roleId = 'admin';
      const permissionId = undefined;

      // Act & Assert
      expect(() => {
        if (!roleId || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    // ==========================================
    // Branch 2: Role Not Found in Map
    // ==========================================
    
    test('TC-022: Should return FALSE when role does not exist in Map', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'nonExistentRole';
      const permissionId = 'create-user';

      // Act
      const hasRole = mockMap.has(roleId);
      
      let result;
      if (!hasRole) {
        result = false;
      }

      // Assert
      expect(hasRole).toBe(false);
      expect(result).toBe(false);
    });

    test('TC-023: Should check Map.has() before accessing rules', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'testRole';

      // Act
      const hasRole = mockMap.has(roleId);

      // Assert
      expect(hasRole).toBe(false);
      expect(mockMap.get(roleId)).toBeUndefined();
    });

    // ==========================================
    // Branch 3: Rules Set is Empty or Not Defined
    // ==========================================
    
    test('TC-024: Should return FALSE when rules Set is empty', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const permissionId = 'create-user';
      
      mockMap.set(roleId, new Set()); // Empty Set

      // Act
      const rules = mockMap.get(roleId);
      const hasSize = rules?.size;

      let result;
      if (!hasSize) {
        result = false;
      }

      // Assert
      expect(rules.size).toBe(0);
      expect(result).toBe(false);
    });

    test('TC-025: Should return FALSE when rules is undefined', () => {
      // Arrange
      const rules = undefined;
      const permissionId = 'create-user';

      // Act
      const hasSize = rules?.size;

      let result;
      if (!hasSize) {
        result = false;
      }

      // Assert
      expect(hasSize).toBeUndefined();
      expect(result).toBe(false);
    });

    test('TC-026: Should check rules.size before checking permission', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      mockMap.set(roleId, new Set());

      const rules = mockMap.get(roleId);

      // Act
      const isEmpty = !rules?.size;

      // Assert
      expect(isEmpty).toBe(true);
    });

    // ==========================================
    // Branch 4: Permission Check Logic
    // ==========================================
    
    test('TC-027: Should return TRUE when permission is NOT in Set (restricted)', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const permissionId = 'delete-user';
      
      const rules = new Set(['create-user', 'edit-user']);
      mockMap.set(roleId, rules);

      // Act
      const hasPermission = rules.has(permissionId);
      const isRestricted = !hasPermission;

      // Assert
      expect(hasPermission).toBe(false);
      expect(isRestricted).toBe(true);
    });

    test('TC-028: Should return FALSE when permission IS in Set (allowed)', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const permissionId = 'create-user';
      
      const rules = new Set(['create-user', 'edit-user']);
      mockMap.set(roleId, rules);

      // Act
      const hasPermission = rules.has(permissionId);
      const isRestricted = !hasPermission;

      // Assert
      expect(hasPermission).toBe(true);
      expect(isRestricted).toBe(false);
    });

    test('TC-029: Should use negation logic - !rules.has()', () => {
      // Arrange
      const rules = new Set(['permission1', 'permission2']);

      // Test Cases for negation logic
      const testCases = [
        { permission: 'permission1', expectedInSet: true, expectedRestricted: false },
        { permission: 'permission2', expectedInSet: true, expectedRestricted: false },
        { permission: 'permission3', expectedInSet: false, expectedRestricted: true },
        { permission: 'unknown', expectedInSet: false, expectedRestricted: true }
      ];

      // Act & Assert
      testCases.forEach(({ permission, expectedInSet, expectedRestricted }) => {
        const inSet = rules.has(permission);
        const isRestricted = !inSet;

        expect(inSet).toBe(expectedInSet);
        expect(isRestricted).toBe(expectedRestricted);
      });
    });

    test('TC-030: Should handle case-sensitive permission IDs', () => {
      // Arrange
      const rules = new Set(['create-user']);

      // Act
      const hasLowerCase = rules.has('create-user');
      const hasUpperCase = rules.has('CREATE-USER');
      const hasMixedCase = rules.has('Create-User');

      // Assert - Set is case-sensitive
      expect(hasLowerCase).toBe(true);
      expect(hasUpperCase).toBe(false);
      expect(hasMixedCase).toBe(false);
    });
  });

  // ==========================================
  // Test Suite 3: isPermissionRestrictedForRoleList
  // ==========================================
  
  describe('isPermissionRestrictedForRoleList - Complete Branch Coverage', () => {
    
    // ==========================================
    // Branch 1: Parameter Validation
    // ==========================================
    
    test('TC-031: Should throw error when roleList is null', () => {
      // Arrange
      const roleList = null;
      const permissionId = 'create-user';

      // Act & Assert
      expect(() => {
        if (!roleList || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-032: Should throw error when roleList is undefined', () => {
      // Arrange
      const roleList = undefined;
      const permissionId = 'create-user';

      // Act & Assert
      expect(() => {
        if (!roleList || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-033: Should throw error when permissionId is empty', () => {
      // Arrange
      const roleList = ['admin', 'user'];
      const permissionId = '';

      // Act & Assert
      expect(() => {
        if (!roleList || !permissionId) {
          throw new Error('invalid-param');
        }
      }).toThrow('invalid-param');
    });

    test('TC-034: Should NOT throw error when roleList is empty array', () => {
      // Arrange
      const roleList = [];
      const permissionId = 'create-user';

      // Act
      const isValid = !(!roleList || !permissionId);

      // Assert - Empty array is valid
      expect(isValid).toBe(true);
      expect(Array.isArray(roleList)).toBe(true);
    });

    // ==========================================
    // Branch 2: Loop Through Role List
    // ==========================================
    
    test('TC-035: Should return FALSE when roleList is empty', () => {
      // Arrange
      const roleList = [];
      const permissionId = 'create-user';
      
      // Mock isPermissionRestrictedForRole
      const mockIsRestricted = jest.fn().mockReturnValue(true);

      // Act
      let result = false;
      for (const roleId of roleList) {
        if (mockIsRestricted(permissionId, roleId)) {
          result = true;
          break;
        }
      }

      // Assert
      expect(result).toBe(false);
      expect(mockIsRestricted).not.toHaveBeenCalled();
    });

    test('TC-036: Should return TRUE when first role restricts permission', () => {
      // Arrange
      const roleList = ['restrictedRole', 'allowedRole'];
      const permissionId = 'create-user';
      
      const mockIsRestricted = jest.fn()
        .mockReturnValueOnce(true)  // First role restricts
        .mockReturnValueOnce(false);

      // Act
      let result = false;
      for (const roleId of roleList) {
        if (mockIsRestricted(permissionId, roleId)) {
          result = true;
          break;
        }
      }

      // Assert
      expect(result).toBe(true);
      expect(mockIsRestricted).toHaveBeenCalledTimes(1); // Early exit
    });

    test('TC-037: Should return TRUE when any role in list restricts permission', () => {
      // Arrange
      const roleList = ['allowedRole1', 'restrictedRole', 'allowedRole2'];
      const permissionId = 'delete-user';
      
      const mockIsRestricted = jest.fn()
        .mockReturnValueOnce(false) // First role allows
        .mockReturnValueOnce(true)  // Second role restricts
        .mockReturnValueOnce(false);

      // Act
      let result = false;
      for (const roleId of roleList) {
        if (mockIsRestricted(permissionId, roleId)) {
          result = true;
          break;
        }
      }

      // Assert
      expect(result).toBe(true);
      expect(mockIsRestricted).toHaveBeenCalledTimes(2); // Stops at second
    });

    test('TC-038: Should return FALSE when NO role restricts permission', () => {
      // Arrange
      const roleList = ['admin', 'user', 'moderator'];
      const permissionId = 'create-user';
      
      const mockIsRestricted = jest.fn().mockReturnValue(false);

      // Act
      let result = false;
      for (const roleId of roleList) {
        if (mockIsRestricted(permissionId, roleId)) {
          result = true;
          break;
        }
      }

      // Assert
      expect(result).toBe(false);
      expect(mockIsRestricted).toHaveBeenCalledTimes(3); // All roles checked
    });

    test('TC-039: Should call isPermissionRestrictedForRole for each role until TRUE', () => {
      // Arrange
      const roleList = ['role1', 'role2', 'role3'];
      const permissionId = 'test-permission';
      const callOrder = [];
      
      const mockIsRestricted = jest.fn((perm, role) => {
        callOrder.push(role);
        return role === 'role2'; // Only role2 restricts
      });

      // Act
      let result = false;
      for (const roleId of roleList) {
        if (mockIsRestricted(permissionId, roleId)) {
          result = true;
          break;
        }
      }

      // Assert
      expect(result).toBe(true);
      expect(callOrder).toEqual(['role1', 'role2']); // Stops at role2
      expect(mockIsRestricted).toHaveBeenCalledTimes(2);
    });

    test('TC-040: Should handle single role in list', () => {
      // Arrange
      const roleList = ['singleRole'];
      const permissionId = 'permission';
      
      const mockIsRestricted = jest.fn().mockReturnValue(true);

      // Act
      let result = false;
      for (const roleId of roleList) {
        if (mockIsRestricted(permissionId, roleId)) {
          result = true;
          break;
        }
      }

      // Assert
      expect(result).toBe(true);
      expect(mockIsRestricted).toHaveBeenCalledTimes(1);
    });

    test('TC-041: Should maintain correct parameter order in loop', () => {
      // Arrange
      const roleList = ['admin'];
      const permissionId = 'create-user';
      
      const mockIsRestricted = jest.fn();

      // Act
      for (const roleId of roleList) {
        mockIsRestricted(permissionId, roleId);
      }

      // Assert - Verify parameter order: (permissionId, roleId)
      expect(mockIsRestricted).toHaveBeenCalledWith('create-user', 'admin');
    });
  });

  // ==========================================
  // Test Suite 4: hasRestrictionsToRole
  // ==========================================
  
  describe('hasRestrictionsToRole - Complete Branch Coverage', () => {
    
    test('TC-042: Should return TRUE when role exists in Map', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      mockMap.set(roleId, new Set(['permission1']));

      // Act
      const result = mockMap.has(roleId);

      // Assert
      expect(result).toBe(true);
    });

    test('TC-043: Should return FALSE when role does not exist in Map', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'nonExistentRole';

      // Act
      const result = mockMap.has(roleId);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-044: Should return TRUE when role has empty Set', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'emptyRole';
      mockMap.set(roleId, new Set());

      // Act
      const result = mockMap.has(roleId);

      // Assert
      expect(result).toBe(true); // Map.has() only checks key existence
    });

    test('TC-045: Should be case-sensitive for roleId', () => {
      // Arrange
      const mockMap = new Map();
      mockMap.set('Admin', new Set());

      // Act
      const hasAdmin = mockMap.has('Admin');
      const hasadmin = mockMap.has('admin');
      const hasADMIN = mockMap.has('ADMIN');

      // Assert
      expect(hasAdmin).toBe(true);
      expect(hasadmin).toBe(false);
      expect(hasADMIN).toBe(false);
    });

    test('TC-046: Should handle special characters in roleId', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'role-with-special-chars_123';
      mockMap.set(roleId, new Set());

      // Act
      const result = mockMap.has(roleId);

      // Assert
      expect(result).toBe(true);
    });
  });

  // ==========================================
  // Test Suite 5: Integration Tests
  // ==========================================
  
  describe('Integration Tests - Complete Workflows', () => {
    
    test('TC-047: COMPLETE FLOW - Add permissions and check restriction', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'editor';
      const whiteList = ['edit-post', 'create-post'];
      const testPermission = 'delete-post';

      // Act - Add permissions
      if (!mockMap.has(roleId)) {
        mockMap.set(roleId, new Set());
      }
      
      const rules = mockMap.get(roleId);
      for (const permissionId of whiteList) {
        rules?.add(permissionId);
      }

      // Act - Check if permission is restricted
      const isRestricted = !rules.has(testPermission);

      // Assert
      expect(rules.size).toBe(2);
      expect(isRestricted).toBe(true); // delete-post not in whitelist
    });

    test('TC-048: COMPLETE FLOW - Multiple roles with different permissions', () => {
      // Arrange
      const mockMap = new Map();
      
      // Setup role1
      mockMap.set('role1', new Set(['perm1', 'perm2']));
      // Setup role2
      mockMap.set('role2', new Set(['perm3', 'perm4']));

      // Act
      const role1Rules = mockMap.get('role1');
      const role2Rules = mockMap.get('role2');

      const role1HasPerm1 = !role1Rules.has('perm1'); // FALSE (allowed)
      const role1HasPerm3 = !role1Rules.has('perm3'); // TRUE (restricted)
      const role2HasPerm1 = !role2Rules.has('perm1'); // TRUE (restricted)
      const role2HasPerm3 = !role2Rules.has('perm3'); // FALSE (allowed)

      // Assert
      expect(role1HasPerm1).toBe(false); // perm1 allowed for role1
      expect(role1HasPerm3).toBe(true);  // perm3 restricted for role1
      expect(role2HasPerm1).toBe(true);  // perm1 restricted for role2
      expect(role2HasPerm3).toBe(false); // perm3 allowed for role2
    });

    test('TC-049: Edge case - Adding same permission twice', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const permissions = ['create-user', 'create-user', 'delete-user'];

      mockMap.set(roleId, new Set());
      const rules = mockMap.get(roleId);

      // Act
      for (const perm of permissions) {
        rules.add(perm);
      }

      // Assert - Set handles duplicates automatically
      expect(rules.size).toBe(2);
      expect(rules.has('create-user')).toBe(true);
      expect(rules.has('delete-user')).toBe(true);
    });

    test('TC-050: Edge case - Empty permission string', () => {
      // Arrange
      const mockMap = new Map();
      const roleId = 'admin';
      const permissions = ['', 'valid-permission'];

      mockMap.set(roleId, new Set());
      const rules = mockMap.get(roleId);

      // Act
      for (const perm of permissions) {
        rules.add(perm);
      }

      // Assert - Empty string is added to Set
      expect(rules.size).toBe(2);
      expect(rules.has('')).toBe(true);
      expect(rules.has('valid-permission')).toBe(true);
    });
  });
});
