const { projectionAllowsAttribute } = require('../src/api/projectionAllowsAttribute');

describe('projectionAllowsAttribute - White-Box Testing', () => {
  
  test('TC-PROJ-001: should return true if there are no options', () => {
    const result = projectionAllowsAttribute('attributeName');
    expect(result).toBe(true);
  });

  test('TC-PROJ-002: should return true if there is no projection', () => {
    const result = projectionAllowsAttribute('attributeName', {});
    expect(result).toBe(true);
  });

  test('TC-PROJ-003: should return true if the field is projected', () => {
    const result = projectionAllowsAttribute('attributeName', { 
      projection: { attributeName: 1 } 
    });
    expect(result).toBe(true);
  });

  test('TC-PROJ-004: should return false if the field is disallowed by projection', () => {
    const result = projectionAllowsAttribute('attributeName', { 
      projection: { attributeName: 0 } 
    });
    expect(result).toBe(false);
  });

  test('TC-PROJ-005: should return false if field not projected and others are', () => {
    const result = projectionAllowsAttribute('attributeName', { 
      projection: { anotherAttribute: 1 } 
    });
    expect(result).toBe(false);
  });

  test('TC-PROJ-006: should return true if field not projected and others disallowed', () => {
    const result = projectionAllowsAttribute('attributeName', { 
      projection: { anotherAttribute: 0 } 
    });
    expect(result).toBe(true);
  });

  test('TC-PROJ-007: should handle multiple projected fields', () => {
    const result = projectionAllowsAttribute('name', { 
      projection: { name: 1, email: 1, age: 1 } 
    });
    expect(result).toBe(true);
  });

  test('TC-PROJ-008: should handle mixed projection values', () => {
    const result = projectionAllowsAttribute('name', { 
      projection: { name: 1, password: 0 } 
    });
    expect(result).toBe(true);
  });

  test('TC-PROJ-009: should handle undefined options', () => {
    const result = projectionAllowsAttribute('test', undefined);
    expect(result).toBe(true);
  });

  test('TC-PROJ-010: should handle null projection', () => {
    const result = projectionAllowsAttribute('test', { projection: null });
    expect(result).toBe(true);
  });
});
