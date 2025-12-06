const { isWidget } = require('../src/api/isWidget');

describe('isWidget - White-Box Testing', () => {
  
  test('TC-WID-001: should return false for empty headers', () => {
    const headers = { get: () => null };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-002: should return true for livechat widget', () => {
    const headers = { get: () => 'rc_room_type=l; rc_is_widget=t' };
    expect(isWidget(headers)).toBe(true);
  });

  test('TC-WID-003: should return false when room type is not livechat', () => {
    const headers = { get: () => 'rc_room_type=c; rc_is_widget=t' };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-004: should return false when is_widget is not t', () => {
    const headers = { get: () => 'rc_room_type=l; rc_is_widget=f' };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-005: should return false when only room_type is present', () => {
    const headers = { get: () => 'rc_room_type=l' };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-006: should return false when only is_widget is present', () => {
    const headers = { get: () => 'rc_is_widget=t' };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-007: should handle cookies with spaces', () => {
    const headers = { get: () => 'rc_room_type=l ; rc_is_widget=t' };
    expect(isWidget(headers)).toBe(true);
  });

  test('TC-WID-008: should handle multiple cookies', () => {
    const headers = { get: () => 'other=value; rc_room_type=l; rc_is_widget=t; more=stuff' };
    expect(isWidget(headers)).toBe(true);
  });

  test('TC-WID-009: should return false for undefined cookie', () => {
    const headers = { get: () => undefined };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-010: should return false for empty cookie string', () => {
    const headers = { get: () => '' };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-011: should handle headers without get method', () => {
    const headers = { cookie: 'rc_room_type=l; rc_is_widget=t' };
    expect(isWidget(headers)).toBe(true);
  });

  test('TC-WID-012: should return boolean value', () => {
    const headers = { get: () => 'rc_room_type=l; rc_is_widget=t' };
    const result = isWidget(headers);
    expect(typeof result).toBe('boolean');
  });

  test('TC-WID-013: should handle malformed cookies', () => {
    const headers = { get: () => 'invalid cookie format' };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-014: should be case sensitive for room type', () => {
    const headers = { get: () => 'rc_room_type=L; rc_is_widget=t' };
    expect(isWidget(headers)).toBe(false);
  });

  test('TC-WID-015: should be case sensitive for widget flag', () => {
    const headers = { get: () => 'rc_room_type=l; rc_is_widget=T' };
    expect(isWidget(headers)).toBe(false);
  });
});
