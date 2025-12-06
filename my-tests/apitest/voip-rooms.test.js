/**
 * VoIP Rooms - White-Box Testing
 * Tests: Room helper functions and management
 * Total: 25 tests
 */

const {
  parseDateParams,
  validateDateParams,
  parseAndValidate,
  isRoomSearchProps,
  isRoomCreationProps,
  findVoipRoom,
  closeVoipRoom
} = require('../src/api/voip-endpoints/rooms');

describe('VoIP Rooms - White-Box Testing', () => {
  describe('parseDateParams', () => {
    test('TC-VOIP-ROOM-001: should parse valid JSON date string', () => {
      const result = parseDateParams('{"start":"2024-01-01","end":"2024-12-31"}');
      
      expect(result).toHaveProperty('start', '2024-01-01');
      expect(result).toHaveProperty('end', '2024-12-31');
    });

    test('TC-VOIP-ROOM-002: should return empty object for non-string input', () => {
      const result = parseDateParams(123);
      
      expect(result).toEqual({});
    });

    test('TC-VOIP-ROOM-003: should return empty object for undefined', () => {
      const result = parseDateParams(undefined);
      
      expect(result).toEqual({});
    });

    test('TC-VOIP-ROOM-004: should handle null input', () => {
      const result = parseDateParams(null);
      
      expect(result).toEqual({});
    });
  });

  describe('validateDateParams', () => {
    test('TC-VOIP-ROOM-005: should validate correct start date', () => {
      const result = validateDateParams('createdAt', { start: '2024-01-01' });
      
      expect(result).toHaveProperty('start', '2024-01-01');
    });

    test('TC-VOIP-ROOM-006: should throw error for invalid start date', () => {
      expect(() => {
        validateDateParams('createdAt', { start: 'invalid-date' });
      }).toThrow('The "createdAt.start" query parameter must be a valid date.');
    });

    test('TC-VOIP-ROOM-007: should throw error for invalid end date', () => {
      expect(() => {
        validateDateParams('closedAt', { end: 'invalid-date' });
      }).toThrow('The "closedAt.end" query parameter must be a valid date.');
    });

    test('TC-VOIP-ROOM-008: should validate both start and end dates', () => {
      const result = validateDateParams('createdAt', {
        start: '2024-01-01',
        end: '2024-12-31'
      });
      
      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2024-12-31');
    });

    test('TC-VOIP-ROOM-009: should handle empty date object', () => {
      const result = validateDateParams('createdAt', {});
      
      expect(result).toEqual({});
    });

    test('TC-VOIP-ROOM-010: should handle undefined date parameter', () => {
      const result = validateDateParams('createdAt', undefined);
      
      expect(result).toEqual({});
    });
  });

  describe('parseAndValidate', () => {
    test('TC-VOIP-ROOM-011: should parse and validate valid date string', () => {
      const result = parseAndValidate('createdAt', '{"start":"2024-01-01"}');
      
      expect(result).toHaveProperty('start', '2024-01-01');
    });

    test('TC-VOIP-ROOM-012: should throw error for invalid parsed date', () => {
      expect(() => {
        parseAndValidate('createdAt', '{"start":"invalid"}');
      }).toThrow('must be a valid date');
    });

    test('TC-VOIP-ROOM-013: should handle undefined date string', () => {
      const result = parseAndValidate('createdAt', undefined);
      
      expect(result).toEqual({});
    });
  });

  describe('isRoomSearchProps', () => {
    test('TC-VOIP-ROOM-014: should return true for valid search props', () => {
      const result = isRoomSearchProps({ rid: 'room123', token: 'token123' });
      
      expect(result).toBe(true);
    });

    test('TC-VOIP-ROOM-015: should return false when rid missing', () => {
      const result = isRoomSearchProps({ token: 'token123' });
      
      expect(result).toBe(false);
    });

    test('TC-VOIP-ROOM-016: should return false when token missing', () => {
      const result = isRoomSearchProps({ rid: 'room123' });
      
      expect(result).toBe(false);
    });

    test('TC-VOIP-ROOM-017: should return false for empty object', () => {
      const result = isRoomSearchProps({});
      
      expect(result).toBe(false);
    });
  });

  describe('isRoomCreationProps', () => {
    test('TC-VOIP-ROOM-018: should return true for valid creation props', () => {
      const result = isRoomCreationProps({ agentId: 'agent123', direction: 'inbound' });
      
      expect(result).toBe(true);
    });

    test('TC-VOIP-ROOM-019: should return false when agentId missing', () => {
      const result = isRoomCreationProps({ direction: 'inbound' });
      
      expect(result).toBe(false);
    });

    test('TC-VOIP-ROOM-020: should return false when direction missing', () => {
      const result = isRoomCreationProps({ agentId: 'agent123' });
      
      expect(result).toBe(false);
    });

    test('TC-VOIP-ROOM-021: should return false for empty object', () => {
      const result = isRoomCreationProps({});
      
      expect(result).toBe(false);
    });
  });

  describe('findVoipRoom', () => {
    test('TC-VOIP-ROOM-022: should find room with valid token and rid', async () => {
      const result = await findVoipRoom('token123', 'room123');
      
      expect(result).toHaveProperty('_id', 'room123');
      expect(result).toHaveProperty('token', 'token123');
    });

    test('TC-VOIP-ROOM-023: should return null without token', async () => {
      const result = await findVoipRoom(null, 'room123');
      
      expect(result).toBeNull();
    });

    test('TC-VOIP-ROOM-024: should return null without rid', async () => {
      const result = await findVoipRoom('token123', null);
      
      expect(result).toBeNull();
    });
  });

  describe('closeVoipRoom', () => {
    test('TC-VOIP-ROOM-025: should close open room', async () => {
      const visitor = { _id: 'visitor123' };
      const room = { _id: 'room123', open: true };
      const user = { _id: 'user123' };
      
      const result = await closeVoipRoom(visitor, room, user, 'voip-call-wrapup', {});
      
      expect(result).toHaveProperty('rid', 'room123');
      expect(result).toHaveProperty('closed', true);
    });
  });
});
