const { isUserFromParams } = require('../src/api/isUserFromParams');

describe('isUserFromParams - White-Box Testing', () => {
  const loggedInUserId = 'user123';
  const loggedInUser = { _id: 'user123', username: 'testuser' };

  test('TC-USER-001: should return true when no params provided', () => {
    const result = isUserFromParams({}, loggedInUserId, loggedInUser);
    expect(result).toBe(true);
  });

  test('TC-USER-002: should return true when userId matches', () => {
    const result = isUserFromParams({ userId: 'user123' }, loggedInUserId, loggedInUser);
    expect(result).toBe(true);
  });

  test('TC-USER-003: should return false when userId does not match', () => {
    const result = isUserFromParams({ userId: 'user999' }, loggedInUserId, loggedInUser);
    expect(result).toBe(false);
  });

  test('TC-USER-004: should return true when username matches', () => {
    const result = isUserFromParams({ username: 'testuser' }, loggedInUserId, loggedInUser);
    expect(result).toBe(true);
  });

  test('TC-USER-005: should return false when username does not match', () => {
    const result = isUserFromParams({ username: 'other' }, loggedInUserId, loggedInUser);
    expect(result).toBe(false);
  });

  test('TC-USER-006: should return true when user param matches username', () => {
    const result = isUserFromParams({ user: 'testuser' }, loggedInUserId, loggedInUser);
    expect(result).toBe(true);
  });

  test('TC-USER-007: should return false when user param does not match', () => {
    const result = isUserFromParams({ user: 'other' }, loggedInUserId, loggedInUser);
    expect(result).toBe(false);
  });

  test('TC-USER-008: should handle undefined loggedInUser', () => {
    const result = isUserFromParams({ username: 'testuser' }, loggedInUserId, undefined);
    expect(result).toBe(false);
  });

  test('TC-USER-009: should handle empty params object', () => {
    const result = isUserFromParams({}, loggedInUserId, loggedInUser);
    expect(result).toBe(true);
  });

  test('TC-USER-010: should return false when multiple params dont match', () => {
    const result = isUserFromParams({ userId: 'wrong', username: 'wrong' }, loggedInUserId, loggedInUser);
    expect(result).toBe(false);
  });

  test('TC-USER-011: should handle null loggedInUser', () => {
    const result = isUserFromParams({ username: 'testuser' }, loggedInUserId, null);
    expect(result).toBe(false);
  });

  test('TC-USER-012: should return true when empty string treated as no param', () => {
    // Empty string is falsy, function logic: (!params.userId && !params.username && !params.user)
    // '' is falsy, so !'' = true, thus condition becomes true
    const result = isUserFromParams({ userId: '' }, loggedInUserId, loggedInUser);
    expect(result).toBe(true); // ✅ CORRECTED
  });

  test('TC-USER-013: should prioritize userId over username', () => {
    const result = isUserFromParams({ userId: 'user123', username: 'wrong' }, loggedInUserId, loggedInUser);
    expect(result).toBe(true);
  });

  test('TC-USER-014: should handle loggedInUser without username', () => {
    const result = isUserFromParams({ username: 'testuser' }, loggedInUserId, { _id: 'user123' });
    expect(result).toBe(false);
  });

  test('TC-USER-015: should return boolean value', () => {
    const result = isUserFromParams({}, loggedInUserId, loggedInUser);
    expect(typeof result).toBe('boolean');
  });
});
