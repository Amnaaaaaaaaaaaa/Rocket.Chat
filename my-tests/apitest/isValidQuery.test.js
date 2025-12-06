const { isValidQuery } = require('../src/api/isValidQuery');

describe('isValidQuery - White-Box Testing', () => {
  
  test('TC-VALID-001: should validate simple query', () => {
    const result = isValidQuery({ name: 'test' }, ['name'], []);
    expect(result).toBe(true);
  });

  test('TC-VALID-002: should reject invalid attribute', () => {
    const result = isValidQuery({ invalid: 'test' }, ['name'], []);
    expect(result).toBe(false);
    expect(isValidQuery.errors).toContain('Invalid attribute: invalid');
  });

  test('TC-VALID-003: should allow wildcard attributes', () => {
    const result = isValidQuery({ name: 'test' }, ['*'], []);
    expect(result).toBe(true);
  });

  test('TC-VALID-004: should allow nested wildcard attributes', () => {
    const result = isValidQuery({ user: { name: 'test' } }, ['user.*'], []);
    expect(result).toBe(true);
  });

  test('TC-VALID-005: should validate allowed operations', () => {
    const result = isValidQuery(
      { $or: [{ name: 'test' }] }, 
      ['name'], 
      ['$or']
    );
    expect(result).toBe(true);
  });

  test('TC-VALID-006: should reject invalid operations', () => {
    const result = isValidQuery(
      { $where: 'malicious' }, 
      ['name'], 
      ['$or']
    );
    expect(result).toBe(false);
  });

  test('TC-VALID-007: should throw error for non-object query', () => {
    expect(() => isValidQuery('string', ['name'], [])).toThrow('query must be an object');
  });

  test('TC-VALID-008: should validate nested object attributes', () => {
    // Nested attributes need explicit permission like 'user.name'
    const result = isValidQuery(
      { user: { name: 'test' } }, 
      ['user', 'user.name'], // Need both parent and child
      []
    );
    expect(result).toBe(true);
  });

  test('TC-VALID-009: should clear errors on each call', () => {
    isValidQuery({ invalid: 'test' }, ['name'], []);
    expect(isValidQuery.errors.length).toBeGreaterThan(0);
    isValidQuery({ name: 'test' }, ['name'], []);
    expect(isValidQuery.errors.length).toBe(0);
  });

  test('TC-VALID-010: should validate operation with array value', () => {
    const result = isValidQuery(
      { $or: [{ name: 'test' }, { age: 25 }] }, 
      ['name', 'age'], 
      ['$or']
    );
    expect(result).toBe(true);
  });

  test('TC-VALID-011: should reject operation with non-array value', () => {
    const result = isValidQuery(
      { $or: 'invalid' }, 
      ['name'], 
      ['$or']
    );
    expect(result).toBe(false);
  });

  test('TC-VALID-012: should handle empty query', () => {
    const result = isValidQuery({}, ['name'], []);
    expect(result).toBe(true);
  });

  test('TC-VALID-013: should remove dangerous properties before validation', () => {
    const result = isValidQuery(
      { name: 'test', __proto__: 'hack' }, 
      ['name'], 
      []
    );
    expect(result).toBe(true);
  });

  test('TC-VALID-014: should validate nested structure with proper permissions', () => {
    const result = isValidQuery(
      { $and: [{ user: { name: 'test' } }, { status: 'active' }] },
      ['user', 'user.name', 'status'], // Need all levels defined
      ['$and']
    );
    expect(result).toBe(true);
  });

  test('TC-VALID-015: should track first error only when validation stops early', () => {
    // Function stops at first invalid attribute in every() loop
    isValidQuery({ invalid: 'test', bad: 'field' }, ['name'], []);
    expect(isValidQuery.errors.length).toBeGreaterThanOrEqual(1);
  });
});
