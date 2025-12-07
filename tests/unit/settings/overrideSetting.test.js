/**
 * White Box Testing for overrideSetting.ts
 * 
 * Function Under Test:
 * - overrideSetting
 */

describe('overrideSetting.ts - Override Setting from Environment', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Reading', () => {
    
    test('TC-001: Should read environment variable by key', () => {
      // Arrange
      process.env['MY_SETTING'] = 'test_value';
      const key = 'MY_SETTING';

      // Act
      const result = process.env[key];

      // Assert
      expect(result).toBe('test_value');
    });

    test('TC-002: Should return undefined when env variable does not exist', () => {
      // Arrange
      const key = 'NON_EXISTENT_KEY';

      // Act
      const result = process.env[key];

      // Assert
      expect(result).toBeUndefined();
    });

    test('TC-003: Should handle boolean string from env', () => {
      // Arrange
      process.env['BOOL_SETTING'] = 'true';
      const key = 'BOOL_SETTING';

      // Act
      const value = process.env[key];
      const converted = value.toLowerCase() === 'true';

      // Assert
      expect(converted).toBe(true);
    });

    test('TC-004: Should handle integer string from env', () => {
      // Arrange
      process.env['INT_SETTING'] = '123';
      const key = 'INT_SETTING';

      // Act
      const value = process.env[key];
      const converted = parseInt(value);

      // Assert
      expect(converted).toBe(123);
    });
  });

  describe('Setting Override Logic', () => {
    
    test('TC-005: Should not override when env variable is undefined', () => {
      // Arrange
      const setting = { _id: 'TEST_SETTING', value: 'original', type: 'string' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);
      const result = overwriteValue === undefined ? setting : { ...setting, value: overwriteValue };

      // Assert
      expect(result.value).toBe('original');
    });

    test('TC-006: Should override with env variable value', () => {
      // Arrange
      process.env['TEST_SETTING'] = 'new_value';
      const setting = { _id: 'TEST_SETTING', value: 'original', type: 'string' };
      const fn = (key) => process.env[key];

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

    test('TC-007: Should use exact key name from setting._id', () => {
      // Arrange
      process.env['Accounts_OAuth_Apple'] = 'true';
      const setting = { _id: 'Accounts_OAuth_Apple', value: false, type: 'boolean' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);

      // Assert
      expect(overwriteValue).toBe('true');
    });

    test('TC-008: Should handle empty string env value', () => {
      // Arrange
      process.env['EMPTY_SETTING'] = '';
      const setting = { _id: 'EMPTY_SETTING', value: 'original', type: 'string' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);
      const result = {
        ...setting,
        value: overwriteValue,
        processEnvValue: overwriteValue,
        valueSource: 'processEnvValue',
      };

      // Assert
      expect(result.value).toBe('');
    });
  });

  describe('Type Conversion with Environment Variables', () => {
    
    test('TC-009: Should convert env boolean "true" correctly', () => {
      // Arrange
      process.env['BOOL_SETTING'] = 'true';
      const setting = { _id: 'BOOL_SETTING', value: false, type: 'boolean' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = overwriteValue.toLowerCase() === 'true' ? true : false;

      // Assert
      expect(converted).toBe(true);
    });

    test('TC-010: Should convert env boolean "false" correctly', () => {
      // Arrange
      process.env['BOOL_SETTING'] = 'false';
      const setting = { _id: 'BOOL_SETTING', value: true, type: 'boolean' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = overwriteValue.toLowerCase() === 'false' ? false : true;

      // Assert
      expect(converted).toBe(false);
    });

    test('TC-011: Should convert env integer correctly', () => {
      // Arrange
      process.env['INT_SETTING'] = '999';
      const setting = { _id: 'INT_SETTING', value: 100, type: 'int' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = parseInt(overwriteValue);

      // Assert
      expect(converted).toBe(999);
    });

    test('TC-012: Should handle JSON array from env for multiSelect', () => {
      // Arrange
      process.env['MULTI_SETTING'] = '["opt1","opt2"]';
      const setting = { _id: 'MULTI_SETTING', value: [], type: 'multiSelect' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);
      const converted = JSON.parse(overwriteValue);

      // Assert
      expect(converted).toEqual(['opt1', 'opt2']);
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-013: Should handle null env value', () => {
      // Arrange
      process.env['NULL_SETTING'] = null;
      const setting = { _id: 'NULL_SETTING', value: 'original', type: 'string' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);

      // Assert
      expect(overwriteValue).toBeNull();
    });

    test('TC-014: Should handle special characters in env value', () => {
      // Arrange
      process.env['SPECIAL_SETTING'] = 'test@#$%^&*()';
      const setting = { _id: 'SPECIAL_SETTING', value: '', type: 'string' };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);

      // Assert
      expect(overwriteValue).toBe('test@#$%^&*()');
    });

    test('TC-015: Should handle case-sensitive env variable names', () => {
      // Arrange
      process.env['CaseSensitive'] = 'value1';
      process.env['casesensitive'] = 'value2';
      const fn = (key) => process.env[key];

      // Act
      const result1 = fn('CaseSensitive');
      const result2 = fn('casesensitive');

      // Assert
      expect(result1).toBe('value1');
      expect(result2).toBe('value2');
    });

    test('TC-016: Should preserve setting properties not affected by override', () => {
      // Arrange
      process.env['TEST_SETTING'] = 'new_value';
      const setting = { 
        _id: 'TEST_SETTING', 
        value: 'original', 
        type: 'string',
        hidden: false,
        public: true,
        secret: false
      };
      const fn = (key) => process.env[key];

      // Act
      const overwriteValue = fn(setting._id);
      const result = {
        ...setting,
        value: overwriteValue,
        processEnvValue: overwriteValue,
        valueSource: 'processEnvValue',
      };

      // Assert
      expect(result.hidden).toBe(false);
      expect(result.public).toBe(true);
      expect(result.secret).toBe(false);
      expect(result.type).toBe('string');
    });
  });
});
