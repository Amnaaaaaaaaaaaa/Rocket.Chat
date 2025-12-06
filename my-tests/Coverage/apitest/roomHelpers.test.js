const {
  parseDateParams,
  validateDateParams,
  parseAndValidate,
  isRoomSearchProps,
  isRoomCreationProps
} = require('../src/api/voip/roomHelpers');

describe('Room Helpers - White-Box Testing', () => {
  
  describe('parseDateParams', () => {
    test('TC-ROOM-001: should parse valid JSON date string', () => {
      const result = parseDateParams('{"start":"2024-01-01","end":"2024-12-31"}');
      expect(result).toEqual({ start: '2024-01-01', end: '2024-12-31' });
    });

    test('TC-ROOM-002: should return empty object for non-string input', () => {
      expect(parseDateParams(null)).toEqual({});
      expect(parseDateParams(undefined)).toEqual({});
      expect(parseDateParams(123)).toEqual({});
    });

    test('TC-ROOM-003: should handle empty string', () => {
      expect(parseDateParams('')).toEqual({});
    });
  });

  describe('validateDateParams', () => {
    test('TC-ROOM-004: should validate correct start date', () => {
      const result = validateDateParams('createdAt', { start: '2024-01-01' });
      expect(result).toEqual({ start: '2024-01-01' });
    });

    test('TC-ROOM-005: should throw error for invalid start date', () => {
      expect(() => {
        validateDateParams('createdAt', { start: 'invalid-date' });
      }).toThrow('The "createdAt.start" query parameter must be a valid date.');
    });

    test('TC-ROOM-006: should throw error for invalid end date', () => {
      expect(() => {
        validateDateParams('closedAt', { end: 'not-a-date' });
      }).toThrow('The "closedAt.end" query parameter must be a valid date.');
    });

    test('TC-ROOM-007: should validate both start and end dates', () => {
      const result = validateDateParams('createdAt', { 
        start: '2024-01-01', 
        end: '2024-12-31' 
      });
      expect(result).toEqual({ start: '2024-01-01', end: '2024-12-31' });
    });

    test('TC-ROOM-008: should handle undefined date param', () => {
      const result = validateDateParams('createdAt', undefined);
      expect(result).toEqual({});
    });
  });

  describe('parseAndValidate', () => {
    test('TC-ROOM-009: should parse and validate valid date string', () => {
      const result = parseAndValidate('createdAt', '{"start":"2024-01-01"}');
      expect(result).toEqual({ start: '2024-01-01' });
    });

    test('TC-ROOM-010: should throw error for invalid parsed date', () => {
      expect(() => {
        parseAndValidate('createdAt', '{"start":"invalid"}');
      }).toThrow();
    });
  });

  describe('isRoomSearchProps', () => {
    test('TC-ROOM-011: should return true for valid search props', () => {
      expect(isRoomSearchProps({ rid: 'room123', token: 'token456' })).toBe(true);
    });

    test('TC-ROOM-012: should return false when rid missing', () => {
      expect(isRoomSearchProps({ token: 'token456' })).toBe(false);
    });

    test('TC-ROOM-013: should return false when token missing', () => {
      expect(isRoomSearchProps({ rid: 'room123' })).toBe(false);
    });

    test('TC-ROOM-014: should return false for empty object', () => {
      expect(isRoomSearchProps({})).toBe(false);
    });
  });

  describe('isRoomCreationProps', () => {
    test('TC-ROOM-015: should return true for valid creation props', () => {
      expect(isRoomCreationProps({ agentId: 'agent123', direction: 'inbound' })).toBe(true);
    });

    test('TC-ROOM-016: should return false when agentId missing', () => {
      expect(isRoomCreationProps({ direction: 'inbound' })).toBe(false);
    });

    test('TC-ROOM-017: should return false when direction missing', () => {
      expect(isRoomCreationProps({ agentId: 'agent123' })).toBe(false);
    });

    test('TC-ROOM-018: should return false for empty object', () => {
      expect(isRoomCreationProps({})).toBe(false);
    });
  });
});
