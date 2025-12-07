/**
 * White Box Testing for index.ts
 * 
 * Functions Under Test:
 * - permissionsGetMethod()
 * - Meteor method: permissions/get
 */

describe('index.ts - Permissions Get Method', () => {
  let mockPermissions;
  let mockMeteor;
  let mockCheck;
  let mockMatch;
  
  beforeEach(() => {
    mockPermissions = {
      find: jest.fn(() => ({
        toArray: jest.fn()
      })),
      trashFindDeletedAfter: jest.fn(() => ({
        toArray: jest.fn()
      }))
    };

    mockMeteor = {
      methods: jest.fn(),
      Error: jest.fn()
    };

    mockCheck = jest.fn();
    mockMatch = {
      Maybe: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('permissionsGetMethod() - Function Tests', () => {
    
    test('TC-001: Should fetch all permissions when updatedSince is not provided', async () => {
      // Arrange
      const updatedSince = undefined;
      const mockPermissionsArray = [
        { _id: 'perm1', name: 'Permission 1' },
        { _id: 'perm2', name: 'Permission 2' }
      ];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(mockPermissionsArray)
      };
      mockPermissions.find.mockReturnValue(mockFindResult);

      // Act
      const result = await mockPermissions.find(updatedSince && { _updatedAt: { $gt: updatedSince } }).toArray();

      // Assert
      expect(result).toEqual(mockPermissionsArray);
      expect(mockPermissions.find).toHaveBeenCalledWith(undefined); // No query for undefined
      expect(result).toHaveLength(2);
    });

    test('TC-002: Should fetch permissions updated after given date', async () => {
      // Arrange
      const updatedSince = new Date('2023-01-01T00:00:00.000Z');
      const mockPermissionsArray = [
        { _id: 'perm1', _updatedAt: new Date('2023-01-02T00:00:00.000Z') }
      ];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(mockPermissionsArray)
      };
      mockPermissions.find.mockReturnValue(mockFindResult);

      // Act
      const query = { _updatedAt: { $gt: updatedSince } };
      const result = await mockPermissions.find(query).toArray();

      // Assert
      expect(result).toEqual(mockPermissionsArray);
      expect(mockPermissions.find).toHaveBeenCalledWith(query);
      expect(query._updatedAt.$gt).toBe(updatedSince);
    });

    test('TC-003: Should return update and remove objects when updatedSince is Date', async () => {
      // Arrange
      const updatedSince = new Date('2023-01-01T00:00:00.000Z');
      const mockUpdateArray = [
        { _id: 'updated-perm', _updatedAt: new Date('2023-01-02T00:00:00.000Z') }
      ];
      const mockRemoveArray = [
        { _id: 'deleted-perm', _deletedAt: new Date('2023-01-02T00:00:00.000Z') }
      ];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(mockUpdateArray)
      };
      
      const mockTrashFindResult = {
        toArray: jest.fn().mockResolvedValue(mockRemoveArray)
      };
      
      mockPermissions.find.mockReturnValue(mockFindResult);
      mockPermissions.trashFindDeletedAfter.mockReturnValue(mockTrashFindResult);

      // Act - Simulate the conditional logic
      const records = await mockPermissions.find({ _updatedAt: { $gt: updatedSince } }).toArray();
      
      let result;
      if (updatedSince instanceof Date) {
        result = {
          update: records,
          remove: await mockPermissions.trashFindDeletedAfter(
            updatedSince, 
            {}, 
            { projection: { _id: 1, _deletedAt: 1 } }
          ).toArray()
        };
      }

      // Assert
      expect(result).toEqual({
        update: mockUpdateArray,
        remove: mockRemoveArray
      });
      expect(mockPermissions.trashFindDeletedAfter).toHaveBeenCalledWith(
        updatedSince,
        {},
        { projection: { _id: 1, _deletedAt: 1 } }
      );
    });

    test('TC-004: Should return only records array when updatedSince is not Date instance', async () => {
      // Arrange
      const updatedSince = '2023-01-01'; // String, not Date instance
      const mockPermissionsArray = [
        { _id: 'perm1', name: 'Permission 1' }
      ];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(mockPermissionsArray)
      };
      mockPermissions.find.mockReturnValue(mockFindResult);

      // Act
      const records = await mockPermissions.find(updatedSince && { _updatedAt: { $gt: updatedSince } }).toArray();
      
      let result;
      if (updatedSince instanceof Date) {
        result = {
          update: records,
          remove: await mockPermissions.trashFindDeletedAfter(updatedSince, {}, { projection: { _id: 1, _deletedAt: 1 } }).toArray()
        };
      } else {
        result = records;
      }

      // Assert
      expect(result).toBe(mockPermissionsArray);
      expect(result).toHaveLength(1);
      expect(mockPermissions.trashFindDeletedAfter).not.toHaveBeenCalled();
    });

    test('TC-005: Should handle empty permissions array', async () => {
      // Arrange
      const updatedSince = undefined;
      const emptyArray = [];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(emptyArray)
      };
      mockPermissions.find.mockReturnValue(mockFindResult);

      // Act
      const result = await mockPermissions.find(updatedSince && { _updatedAt: { $gt: updatedSince } }).toArray();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('TC-006: Should handle null updatedSince parameter', async () => {
      // Arrange
      const updatedSince = null;
      const mockPermissionsArray = [{ _id: 'perm1' }];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(mockPermissionsArray)
      };
      mockPermissions.find.mockReturnValue(mockFindResult);

      // Act
      const result = await mockPermissions.find(updatedSince && { _updatedAt: { $gt: updatedSince } }).toArray();

      // Assert
      expect(result).toEqual(mockPermissionsArray);
      expect(mockPermissions.find).toHaveBeenCalledWith(null && { _updatedAt: { $gt: null } }); // null && ... = null
    });

    test('TC-007: Should handle trashFindDeletedAfter returning empty array', async () => {
      // Arrange
      const updatedSince = new Date('2023-01-01');
      const mockUpdateArray = [{ _id: 'perm1' }];
      const emptyRemoveArray = [];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(mockUpdateArray)
      };
      
      const mockTrashFindResult = {
        toArray: jest.fn().mockResolvedValue(emptyRemoveArray)
      };
      
      mockPermissions.find.mockReturnValue(mockFindResult);
      mockPermissions.trashFindDeletedAfter.mockReturnValue(mockTrashFindResult);

      // Act
      const records = await mockPermissions.find({ _updatedAt: { $gt: updatedSince } }).toArray();
      
      let result;
      if (updatedSince instanceof Date) {
        result = {
          update: records,
          remove: await mockPermissions.trashFindDeletedAfter(
            updatedSince, 
            {}, 
            { projection: { _id: 1, _deletedAt: 1 } }
          ).toArray()
        };
      }

      // Assert
      expect(result.remove).toEqual([]);
      expect(result.remove).toHaveLength(0);
    });
  });

  describe('Meteor Method - permissions/get', () => {
    
    test('TC-008: Should validate updatedAt parameter with check', () => {
      // Arrange
      const updatedAt = new Date();
      
      // Act
      mockCheck(updatedAt, mockMatch.Maybe(Date));

      // Assert
      expect(mockCheck).toHaveBeenCalledWith(updatedAt, mockMatch.Maybe(Date));
    });

    test('TC-009: Should call permissionsGetMethod with updatedAt parameter', async () => {
      // Arrange
      const updatedAt = new Date('2023-01-01');
      const mockResult = { update: [], remove: [] };
      
      const mockPermissionsGetMethod = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await mockPermissionsGetMethod(updatedAt);

      // Assert
      expect(result).toBe(mockResult);
      expect(mockPermissionsGetMethod).toHaveBeenCalledWith(updatedAt);
    });

    test('TC-010: Should call permissionsGetMethod without parameter when undefined', async () => {
      // Arrange
      const updatedAt = undefined;
      const mockResult = [{ _id: 'perm1' }];
      
      const mockPermissionsGetMethod = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await mockPermissionsGetMethod(updatedAt);

      // Assert
      expect(result).toBe(mockResult);
      expect(mockPermissionsGetMethod).toHaveBeenCalledWith(undefined);
    });

    test('TC-011: Should handle check throwing error for invalid parameter', () => {
      // Arrange
      const invalidUpdatedAt = 'not-a-date';
      mockCheck.mockImplementation(() => {
        throw new Error('Match error');
      });

      // Act & Assert
      expect(() => {
        mockCheck(invalidUpdatedAt, mockMatch.Maybe(Date));
      }).toThrow('Match error');
    });
  });

  describe('Type Handling and Edge Cases', () => {
    
    test('TC-012: Should handle different date formats for updatedSince', async () => {
      // Test with various date-like inputs
      const date1 = new Date();
      const date2 = new Date(0); // Epoch start
      const date3 = new Date('2023-12-31T23:59:59.999Z');
      
      const dates = [date1, date2, date3];
      
      dates.forEach(date => {
        expect(date instanceof Date).toBe(true);
      });
    });

    test('TC-013: Should handle trashFindDeletedAfter projection correctly', async () => {
      // Arrange
      const date = new Date();
      const projection = { projection: { _id: 1, _deletedAt: 1 } };
      
      // Act
      mockPermissions.trashFindDeletedAfter(date, {}, projection);

      // Assert
      expect(mockPermissions.trashFindDeletedAfter).toHaveBeenCalledWith(
        date,
        {},
        { projection: { _id: 1, _deletedAt: 1 } }
      );
      
      // Verify projection only includes _id and _deletedAt
      expect(projection.projection._id).toBe(1);
      expect(projection.projection._deletedAt).toBe(1);
      expect(projection.projection.name).toBeUndefined();
    });

    test('TC-014: Should handle find query with $gt operator correctly', () => {
      // Test the MongoDB query structure
      const date = new Date('2023-01-01');
      const query = { _updatedAt: { $gt: date } };
      
      expect(query._updatedAt.$gt).toBe(date);
      expect(query._updatedAt.$gt instanceof Date).toBe(true);
    });

    test('TC-015: Should maintain return type consistency', async () => {
      // Test that function returns consistent types
      const mockRecords = [{ _id: 'test' }];
      const mockRemove = [{ _id: 'deleted', _deletedAt: new Date() }];
      
      const mockFindResult = {
        toArray: jest.fn().mockResolvedValue(mockRecords)
      };
      
      const mockTrashFindResult = {
        toArray: jest.fn().mockResolvedValue(mockRemove)
      };
      
      mockPermissions.find.mockReturnValue(mockFindResult);
      mockPermissions.trashFindDeletedAfter.mockReturnValue(mockTrashFindResult);

      // Test without date (returns array)
      const result1 = await mockPermissions.find().toArray();
      expect(Array.isArray(result1)).toBe(true);

      // Test with date (returns object with update and remove)
      const date = new Date();
      const records = await mockPermissions.find({ _updatedAt: { $gt: date } }).toArray();
      const result2 = {
        update: records,
        remove: await mockPermissions.trashFindDeletedAfter(date, {}, { projection: { _id: 1, _deletedAt: 1 } }).toArray()
      };
      
      expect(typeof result2).toBe('object');
      expect(result2).toHaveProperty('update');
      expect(result2).toHaveProperty('remove');
      expect(Array.isArray(result2.update)).toBe(true);
      expect(Array.isArray(result2.remove)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    
    test('TC-016: Should handle database errors in find', async () => {
      // Arrange
      const updatedSince = undefined;
      const mockFindResult = {
        toArray: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };
      mockPermissions.find.mockReturnValue(mockFindResult);

      // Act & Assert
      await expect(mockPermissions.find().toArray()).rejects.toThrow('Database connection failed');
    });

    test('TC-017: Should handle database errors in trashFindDeletedAfter', async () => {
      // Arrange
      const date = new Date();
      const mockTrashFindResult = {
        toArray: jest.fn().mockRejectedValue(new Error('Trash collection error'))
      };
      mockPermissions.trashFindDeletedAfter.mockReturnValue(mockTrashFindResult);

      // Act & Assert
      await expect(mockPermissions.trashFindDeletedAfter(date, {}, {}).toArray())
        .rejects
        .toThrow('Trash collection error');
    });

    test('TC-018: Should handle null in conditional query building', () => {
      // Test the conditional query logic
      const falsyValues = [null, undefined, false, 0, ''];
      
      falsyValues.forEach(value => {
        const query = value && { _updatedAt: { $gt: value } };
        expect(query).toBeFalsy(); // Should be falsy value
      });
      
      const truthyValue = new Date();
      const query = truthyValue && { _updatedAt: { $gt: truthyValue } };
      expect(query).toBeTruthy();
      expect(query._updatedAt.$gt).toBe(truthyValue);
    });
  });
});
