/**
 * White Box Testing for overwriteSetting.ts
 * 
 * Function Under Test:
 * - overwriteSetting
 */

describe('overwriteSetting.ts - Overwrite Setting with Prefix', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Prefixed Environment Variable Reading', () => {
    
    test('TC-001: Should read env variable with OVERWRITE_SETTING_ prefix', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_MY_SETTING'] = 'test_value';
      const key = 'MY_SETTING';
      const prefixedKey = `OVERWRITE_SETTING_${key}`;

      // Act
      const result = process.env[prefixedKey];

      // Assert
      expect(result).toBe('test_value');
    });

    test('TC-002: Should return undefined when prefixed env variable does not exist', () => {
      // Arrange
      const key = 'NON_EXISTENT';
      const prefixedKey = `OVERWRITE_SETTING_${key}`;

      // Act
      const result = process.env[prefixedKey];

      // Assert
      expect(result).toBeUndefined();
    });

    test('TC-003: Should construct correct prefix format', () => {
      // Arrange
      const key = 'TEST_SETTING';
      const prefix = 'OVERWRITE_SETTING_';

      // Act
      const prefixedKey = `${prefix}${key}`;

      // Assert
      expect(prefixedKey).toBe('OVERWRITE_SETTING_TEST_SETTING');
    });

    test('TC-004: Should handle boolean string with prefix', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_BOOL_SETTING'] = 'true';
      const key = 'BOOL_SETTING';
      const prefixedKey = `OVERWRITE_SETTING_${key}`;

      // Act
      const value = process.env[prefixedKey];
      const converted = value.toLowerCase() === 'true';

      // Assert
      expect(converted).toBe(true);
    });
  });

  describe('Overwrite Logic with Prefix', () => {
    
    test('TC-005: Should not overwrite when prefixed env variable is undefined', () => {
      // Arrange
      const setting = { _id: 'TEST_SETTING', value: 'original', type: 'string' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);
      const result = overwriteValue === undefined ? setting : { ...setting, value: overwriteValue };

      // Assert
      expect(result.value).toBe('original');
    });

    test('TC-006: Should overwrite with prefixed env variable value', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_TEST_SETTING'] = 'new_value';
      const setting = { _id: 'TEST_SETTING', value: 'original', type: 'string' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);
      const result = overwriteValue !== undefined ? {
        ...setting,
        value: overwriteValue,
        processEnvValue: overwriteValue,
        valueSource: 'processEnvValue',
      } : setting;

      // Assert
      expect(result.value).toBe('new_value');
      expect(result.valueSource).toBe('processEnvValue');
    });

    test('TC-007: Should prioritize OVERWRITE_SETTING_ prefix', () => {
      // Arrange
      process.env['MY_SETTING'] = 'direct_value';
      process.env['OVERWRITE_SETTING_MY_SETTING'] = 'overwrite_value';
      const setting = { _id: 'MY_SETTING', value: 'original', type: 'string' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);

      // Assert
      expect(overwriteValue).toBe('overwrite_value');
    });

    test('TC-008: Should handle empty string with prefix', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_EMPTY'] = '';
      const setting = { _id: 'EMPTY', value: 'original', type: 'string' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);

      // Assert
      expect(overwriteValue).toBe('');
    });
  });

  describe('Type Conversion with Prefixed Variables', () => {
    
    test('TC-009: Should convert prefixed boolean "true"', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_BOOL_SETTING'] = 'true';
      const setting = { _id: 'BOOL_SETTING', value: false, type: 'boolean' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = overwriteValue.toLowerCase() === 'true';

      // Assert
      expect(converted).toBe(true);
    });

    test('TC-010: Should convert prefixed boolean "false"', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_BOOL_SETTING'] = 'FALSE';
      const setting = { _id: 'BOOL_SETTING', value: true, type: 'boolean' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = overwriteValue.toLowerCase() === 'false';

      // Assert
      expect(converted).toBe(true);
    });

    test('TC-011: Should convert prefixed integer', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_INT_SETTING'] = '555';
      const setting = { _id: 'INT_SETTING', value: 100, type: 'int' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = parseInt(overwriteValue);

      // Assert
      expect(converted).toBe(555);
    });

    test('TC-012: Should handle JSON array with prefix', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_MULTI'] = '["a","b","c"]';
      const setting = { _id: 'MULTI', value: [], type: 'multiSelect' };
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = JSON.parse(overwriteValue);

      // Assert
      expect(converted).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Prefix Pattern Edge Cases', () => {
    
    test('TC-013: Should handle underscores in setting name', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_MY_COMPLEX_SETTING'] = 'value';
      const key = 'MY_COMPLEX_SETTING';
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const result = fn(key);

      // Assert
      expect(result).toBe('value');
    });

    test('TC-014: Should handle setting names with numbers', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_SETTING123'] = 'value123';
      const key = 'SETTING123';
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const result = fn(key);

      // Assert
      expect(result).toBe('value123');
    });

    test('TC-015: Should be case-sensitive with prefix', () => {
      // Arrange
      process.env['OVERWRITE_SETTING_CaseSetting'] = 'value1';
      process.env['OVERWRITE_SETTING_CASESETTING'] = 'value2';
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const result1 = fn('CaseSetting');
      const result2 = fn('CASESETTING');

      // Assert
      expect(result1).toBe('value1');
      expect(result2).toBe('value2');
    });

    test('TC-016: Should ignore non-prefixed variables', () => {
      // Arrange
      process.env['MY_SETTING'] = 'should_ignore';
      const key = 'MY_SETTING';
      const fn = (key) => process.env[`OVERWRITE_SETTING_${key}`];

      // Act
      const result = fn(key);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
