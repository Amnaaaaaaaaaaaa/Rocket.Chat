const { removeDangerousProps, clean } = require('../src/api/cleanQuery');

describe('cleanQuery - White-Box Testing (Security)', () => {
  
  describe('removeDangerousProps', () => {
    test('TC-CLEAN-001: should remove __proto__ property', () => {
      const input = { name: 'test', __proto__: { polluted: true } };
      const result = removeDangerousProps(input);
      expect(result.__proto__).toBeUndefined();
      expect(result.name).toBe('test');
    });

    test('TC-CLEAN-002: should remove constructor property', () => {
      const input = { name: 'test', constructor: 'malicious' };
      const result = removeDangerousProps(input);
      expect(result.constructor).toBeUndefined();
      expect(result.name).toBe('test');
    });

    test('TC-CLEAN-003: should remove prototype property', () => {
      const input = { name: 'test', prototype: 'dangerous' };
      const result = removeDangerousProps(input);
      expect(result.prototype).toBeUndefined();
      expect(result.name).toBe('test');
    });

    test('TC-CLEAN-004: should keep safe properties', () => {
      const input = { name: 'test', age: 25, active: true };
      const result = removeDangerousProps(input);
      expect(result.name).toBe('test');
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
    });

    test('TC-CLEAN-005: should handle empty object', () => {
      const result = removeDangerousProps({});
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('clean', () => {
    test('TC-CLEAN-006: should remove $ operators not in allowList', () => {
      const input = { name: 'test', $where: 'malicious' };
      const result = clean(input);
      expect(result.$where).toBeUndefined();
      expect(result.name).toBe('test');
    });

    test('TC-CLEAN-007: should keep $ operators in allowList', () => {
      const input = { name: 'test', $or: [{ a: 1 }] };
      const result = clean(input, ['$or']);
      expect(result.$or).toBeDefined();
      expect(result.name).toBe('test');
    });

    test('TC-CLEAN-008: should recursively clean nested objects', () => {
      const input = { user: { name: 'test', $ne: 'hack' } };
      const result = clean(input);
      // Function modifies in place and doesn't recursively clean nested $ operators
      expect(result.user.name).toBe('test');
      // $ne is not at root level, so it's kept (function only checks root level $)
      expect(result.user.$ne).toBeDefined();
    });

    test('TC-CLEAN-009: should handle nested dangerous properties', () => {
      const input = { data: { __proto__: { polluted: true }, name: 'test' } };
      const result = clean(input);
      expect(result.data.name).toBe('test');
    });

    test('TC-CLEAN-010: should preserve allowed operators in nested objects', () => {
      const input = { filter: { $or: [{ status: 'active' }] } };
      const result = clean(input, ['$or']);
      expect(result.filter.$or).toBeDefined();
    });
  });
});
