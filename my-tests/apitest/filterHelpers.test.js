const {
  filter,
  paginate,
  isUserAndExtensionParams,
  isUserIdndTypeParams
} = require('../src/api/voip/filterHelpers');

describe('Filter Helpers - White-Box Testing', () => {
  
  describe('filter', () => {
    const mockData = [
      { extension: '1001', userId: 'user1', state: 'available', queues: ['support', 'sales'] },
      { extension: '1002', userId: 'user2', state: 'busy', queues: ['support'] },
      { extension: '1003', userId: 'user3', state: 'available', queues: ['sales'] },
    ];

    test('TC-FILTER-001: should return all items with no filters', () => {
      const result = filter(mockData, {});
      expect(result).toHaveLength(3);
    });

    test('TC-FILTER-002: should filter by extension', () => {
      const result = filter(mockData, { extension: '1001' });
      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe('1001');
    });

    test('TC-FILTER-003: should filter by agentId', () => {
      const result = filter(mockData, { agentId: 'user2' });
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user2');
    });

    test('TC-FILTER-004: should filter by status', () => {
      const result = filter(mockData, { status: 'available' });
      expect(result).toHaveLength(2);
    });

    test('TC-FILTER-005: should filter by queues', () => {
      const result = filter(mockData, { queues: ['support'] });
      expect(result).toHaveLength(2);
    });

    test('TC-FILTER-006: should handle multiple filters', () => {
      const result = filter(mockData, { status: 'available', queues: ['sales'] });
      expect(result).toHaveLength(2);
    });

    test('TC-FILTER-007: should return empty array when no matches', () => {
      const result = filter(mockData, { extension: '9999' });
      expect(result).toHaveLength(0);
    });

    test('TC-FILTER-008: should handle empty extension filter', () => {
      const result = filter(mockData, { extension: '' });
      expect(result).toHaveLength(3);
    });
  });

  describe('paginate', () => {
    const mockData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    test('TC-PAGE-001: should paginate with default count', () => {
      const result = paginate(mockData);
      expect(result).toHaveLength(10);
    });

    test('TC-PAGE-002: should paginate with custom count', () => {
      const result = paginate(mockData, 5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('TC-PAGE-003: should handle offset', () => {
      const result = paginate(mockData, 3, 2);
      expect(result).toEqual([3, 4, 5]);
    });

    test('TC-PAGE-004: should handle offset beyond array length', () => {
      const result = paginate(mockData, 5, 15);
      expect(result).toEqual([]);
    });

    test('TC-PAGE-005: should handle count larger than remaining items', () => {
      const result = paginate(mockData, 10, 5);
      expect(result).toHaveLength(5);
    });
  });

  describe('isUserAndExtensionParams', () => {
    test('TC-USER-001: should return true for valid params', () => {
      expect(isUserAndExtensionParams({ userId: 'user123', extension: '1001' })).toBe(true);
    });

    test('TC-USER-002: should return false when userId missing', () => {
      expect(isUserAndExtensionParams({ extension: '1001' })).toBe(false);
    });

    test('TC-USER-003: should return false when extension missing', () => {
      expect(isUserAndExtensionParams({ userId: 'user123' })).toBe(false);
    });

    test('TC-USER-004: should handle falsy values', () => {
      expect(isUserAndExtensionParams({ userId: '', extension: '1001' })).toBe(false);
    });
  });

  describe('isUserIdndTypeParams', () => {
    test('TC-TYPE-001: should return true for free type', () => {
      expect(isUserIdndTypeParams({ userId: 'user123', type: 'free' })).toBe(true);
    });

    test('TC-TYPE-002: should return true for allocated type', () => {
      expect(isUserIdndTypeParams({ userId: 'user123', type: 'allocated' })).toBe(true);
    });

    test('TC-TYPE-003: should return true for available type', () => {
      expect(isUserIdndTypeParams({ userId: 'user123', type: 'available' })).toBe(true);
    });

    test('TC-TYPE-004: should return false when userId missing', () => {
      expect(isUserIdndTypeParams({ type: 'free' })).toBe(false);
    });

    test('TC-TYPE-005: should return false when type missing', () => {
      expect(isUserIdndTypeParams({ userId: 'user123' })).toBe(false);
    });
  });
});
