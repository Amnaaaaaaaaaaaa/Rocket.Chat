const {
  UserStatus,
  STATUS_MAP,
  getStatusByIndex,
  getStatusIndex,
  isValidStatus,
  getAllStatuses
} = require('../src/notification/statusMap');

describe('Status Map - White-Box Testing', () => {
  
  // STATUS_MAP TESTS
  test('TC-NOT-001: should have 5 statuses in map', () => {
    expect(STATUS_MAP.length).toBe(5);
  });

  test('TC-NOT-002: should have OFFLINE at index 0', () => {
    expect(STATUS_MAP[0]).toBe(UserStatus.OFFLINE);
  });

  test('TC-NOT-003: should have ONLINE at index 1', () => {
    expect(STATUS_MAP[1]).toBe(UserStatus.ONLINE);
  });

  test('TC-NOT-004: should have AWAY at index 2', () => {
    expect(STATUS_MAP[2]).toBe(UserStatus.AWAY);
  });

  test('TC-NOT-005: should have BUSY at index 3', () => {
    expect(STATUS_MAP[3]).toBe(UserStatus.BUSY);
  });

  test('TC-NOT-006: should have DISABLED at index 4', () => {
    expect(STATUS_MAP[4]).toBe(UserStatus.DISABLED);
  });

  // getStatusByIndex TESTS
  test('TC-NOT-007: should get status by valid index', () => {
    expect(getStatusByIndex(1)).toBe(UserStatus.ONLINE);
  });

  test('TC-NOT-008: should return undefined for invalid index', () => {
    expect(getStatusByIndex(10)).toBeUndefined();
  });

  test('TC-NOT-009: should return undefined for negative index', () => {
    expect(getStatusByIndex(-1)).toBeUndefined();
  });

  test('TC-NOT-010: should get first status (OFFLINE)', () => {
    expect(getStatusByIndex(0)).toBe(UserStatus.OFFLINE);
  });

  test('TC-NOT-011: should get last status (DISABLED)', () => {
    expect(getStatusByIndex(4)).toBe(UserStatus.DISABLED);
  });

  // getStatusIndex TESTS
  test('TC-NOT-012: should get index of ONLINE status', () => {
    expect(getStatusIndex(UserStatus.ONLINE)).toBe(1);
  });

  test('TC-NOT-013: should get index of OFFLINE status', () => {
    expect(getStatusIndex(UserStatus.OFFLINE)).toBe(0);
  });

  test('TC-NOT-014: should return -1 for non-existent status', () => {
    expect(getStatusIndex(999)).toBe(-1);
  });

  test('TC-NOT-015: should get index of AWAY status', () => {
    expect(getStatusIndex(UserStatus.AWAY)).toBe(2);
  });

  test('TC-NOT-016: should get index of BUSY status', () => {
    expect(getStatusIndex(UserStatus.BUSY)).toBe(3);
  });

  // isValidStatus TESTS
  test('TC-NOT-017: should validate ONLINE as valid status', () => {
    expect(isValidStatus(UserStatus.ONLINE)).toBe(true);
  });

  test('TC-NOT-018: should validate OFFLINE as valid status', () => {
    expect(isValidStatus(UserStatus.OFFLINE)).toBe(true);
  });

  test('TC-NOT-019: should return false for invalid status', () => {
    expect(isValidStatus(999)).toBe(false);
  });

  test('TC-NOT-020: should validate all statuses as valid', () => {
    STATUS_MAP.forEach(status => {
      expect(isValidStatus(status)).toBe(true);
    });
  });

  test('TC-NOT-021: should return false for null', () => {
    expect(isValidStatus(null)).toBe(false);
  });

  test('TC-NOT-022: should return false for undefined', () => {
    expect(isValidStatus(undefined)).toBe(false);
  });

  // getAllStatuses TESTS
  test('TC-NOT-023: should return all 5 statuses', () => {
    const statuses = getAllStatuses();
    expect(statuses.length).toBe(5);
  });

  test('TC-NOT-024: should return copy of STATUS_MAP', () => {
    const statuses = getAllStatuses();
    expect(statuses).toEqual(STATUS_MAP);
    expect(statuses).not.toBe(STATUS_MAP);
  });

  test('TC-NOT-025: should not affect original map when modified', () => {
    const statuses = getAllStatuses();
    statuses.push(999);
    expect(STATUS_MAP.length).toBe(5);
  });
});
