/**
 * VoIP Omnichannel - White-Box Testing
 * Tests: Omnichannel helper functions
 * Total: 20 tests
 */

const {
  filter,
  paginate,
  isUserAndExtensionParams,
  isUserIdndTypeParams,
  setExtension,
  getFreeExtensions,
  getExtensionAllocationDetails
} = require('../src/api/voip-endpoints/omnichannel');

describe('VoIP Omnichannel - White-Box Testing', () => {
  describe('filter', () => {
    const testData = [
      { extension: '1001', userId: 'user1', state: 'available', queues: ['queue1', 'queue2'] },
      { extension: '1002', userId: 'user2', state: 'busy', queues: ['queue1'] },
      { extension: '1003', userId: 'user3', state: 'available', queues: ['queue3'] }
    ];

    test('TC-VOIP-OMNI-001: should return all items with no filters', () => {
      const result = filter(testData, {});
      
      expect(result).toHaveLength(3);
    });

    test('TC-VOIP-OMNI-002: should filter by extension', () => {
      const result = filter(testData, { extension: '1001' });
      
      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe('1001');
    });

    test('TC-VOIP-OMNI-003: should filter by agentId', () => {
      const result = filter(testData, { agentId: 'user2' });
      
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user2');
    });

    test('TC-VOIP-OMNI-004: should filter by status', () => {
      const result = filter(testData, { status: 'available' });
      
      expect(result).toHaveLength(2);
    });

    test('TC-VOIP-OMNI-005: should filter by queues', () => {
      const result = filter(testData, { queues: ['queue1'] });
      
      expect(result).toHaveLength(2);
    });

    test('TC-VOIP-OMNI-006: should handle multiple filters', () => {
      const result = filter(testData, {
        status: 'available',
        queues: ['queue1']
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe('1001');
    });

    test('TC-VOIP-OMNI-007: should return empty array when no matches', () => {
      const result = filter(testData, { extension: '9999' });
      
      expect(result).toHaveLength(0);
    });

    test('TC-VOIP-OMNI-008: should handle empty extension filter', () => {
      const result = filter(testData, { extension: '' });
      
      expect(result).toHaveLength(3);
    });
  });

  describe('paginate', () => {
    const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    test('TC-VOIP-OMNI-009: should paginate with default count', () => {
      const result = paginate(testData);
      
      expect(result).toHaveLength(10);
    });

    test('TC-VOIP-OMNI-010: should paginate with custom count', () => {
      const result = paginate(testData, 5);
      
      expect(result).toHaveLength(5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('TC-VOIP-OMNI-011: should handle offset', () => {
      const result = paginate(testData, 3, 5);
      
      expect(result).toHaveLength(3);
      expect(result).toEqual([6, 7, 8]);
    });

    test('TC-VOIP-OMNI-012: should handle offset beyond array length', () => {
      const result = paginate(testData, 5, 20);
      
      expect(result).toHaveLength(0);
    });

    test('TC-VOIP-OMNI-013: should handle count larger than remaining items', () => {
      const result = paginate(testData, 20, 5);
      
      expect(result).toHaveLength(5);
      expect(result).toEqual([6, 7, 8, 9, 10]);
    });
  });

  describe('isUserAndExtensionParams', () => {
    test('TC-VOIP-OMNI-014: should return true for valid params', () => {
      const result = isUserAndExtensionParams({ userId: 'user123', extension: '1001' });
      
      expect(result).toBe(true);
    });

    test('TC-VOIP-OMNI-015: should return false when userId missing', () => {
      const result = isUserAndExtensionParams({ extension: '1001' });
      
      expect(result).toBe(false);
    });

    test('TC-VOIP-OMNI-016: should return false when extension missing', () => {
      const result = isUserAndExtensionParams({ userId: 'user123' });
      
      expect(result).toBe(false);
    });
  });

  describe('isUserIdndTypeParams', () => {
    test('TC-VOIP-OMNI-017: should return true for free type', () => {
      const result = isUserIdndTypeParams({ userId: 'user123', type: 'free' });
      
      expect(result).toBe(true);
    });

    test('TC-VOIP-OMNI-018: should return true for allocated type', () => {
      const result = isUserIdndTypeParams({ userId: 'user123', type: 'allocated' });
      
      expect(result).toBe(true);
    });

    test('TC-VOIP-OMNI-019: should return false when userId missing', () => {
      const result = isUserIdndTypeParams({ type: 'free' });
      
      expect(result).toBe(false);
    });

    test('TC-VOIP-OMNI-020: should return false when type missing', () => {
      const result = isUserIdndTypeParams({ userId: 'user123' });
      
      expect(result).toBe(false);
    });
  });
});
