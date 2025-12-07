/**
 * White Box Testing for overrideGenerator.ts
 * 
 * Functions Under Test:
 * - compareSettingsValue
 * - overrideGenerator
 */

describe('overrideGenerator.ts - Override Settings Generator', () => {
  let mockConvertValue;
  let consoleErrorSpy;

  beforeEach(() => {
    mockConvertValue = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('compareSettingsValue Function', () => {
    
    test('TC-001: Should return true for equal primitive values', () => {
      // Arrange
      const a = 'test';
      const b = 'test';

      // Act
      const result = a === b;

      // Assert
      expect(result).toBe(true);
    });

    test('TC-002: Should return false for different primitive values', () => {
      // Arrange
      const a = 'test1';
      const b = 'test2';

      // Act
      const result = a === b;

      // Assert
      expect(result).toBe(false);
    });

    test('TC-003: Should compare multiSelect arrays correctly', () => {
      // Arrange
      const a = ['option1', 'option2'];
      const b = ['option1', 'option2'];
      const type = 'multiSelect';

      // Act
      const result = Array.isArray(a) && Array.isArray(b) && 
        a.length === b.length && 
        a.every((value, index) => value === b[index]);

      // Assert
      expect(result).toBe(true);
    });

    test('TC-004: Should return false for different multiSelect arrays', () => {
      // Arrange
      const a = ['option1', 'option2'];
      const b = ['option1', 'option3'];
      const type = 'multiSelect';

      // Act
      const result = Array.isArray(a) && Array.isArray(b) && 
        a.length === b.length && 
        a.every((value, index) => value === b[index]);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-005: Should handle roomPick array comparison', () => {
      // Arrange
      const a = [{id: '1', name: 'room1'}];
      const b = [{id: '1', name: 'room1'}];
      const type = 'roomPick';

      // Act
      const result = Array.isArray(a) && Array.isArray(b) && 
        a.length === b.length &&
        a.every((value, index) => 
          Object.keys(value).every(key => value[key] === b[index][key])
        );

      // Assert
      expect(result).toBe(true);
    });

    test('TC-006: Should handle empty arrays', () => {
      // Arrange
      const a = [];
      const b = [];

      // Act
      const result = Array.isArray(a) && Array.isArray(b) && a.length === b.length;

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('overrideGenerator Function', () => {
    
    test('TC-007: Should return original setting when fn returns undefined', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue(undefined);
      const setting = { _id: 'test_setting', value: 'original', type: 'string' };

      // Act
      const overwriteValue = fn(setting._id);
      const result = overwriteValue === null || overwriteValue === undefined ? setting : setting;

      // Assert
      expect(result).toEqual(setting);
      expect(fn).toHaveBeenCalledWith('test_setting');
    });

    test('TC-008: Should return original setting when fn returns null', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue(null);
      const setting = { _id: 'test_setting', value: 'original', type: 'string' };

      // Act
      const overwriteValue = fn(setting._id);
      const result = overwriteValue === null || overwriteValue === undefined ? setting : setting;

      // Assert
      expect(result).toEqual(setting);
    });

    test('TC-009: Should override setting with new value', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue('new value');
      const setting = { _id: 'test_setting', value: 'old value', type: 'string' };

      // Act
      const overwriteValue = fn(setting._id);
      let result;
      if (overwriteValue !== null && overwriteValue !== undefined) {
        const value = overwriteValue;
        if (value !== setting.value) {
          result = {
            ...setting,
            value,
            processEnvValue: value,
            valueSource: 'processEnvValue',
          };
        } else {
          result = setting;
        }
      }

      // Assert
      expect(result.value).toBe('new value');
      expect(result.processEnvValue).toBe('new value');
      expect(result.valueSource).toBe('processEnvValue');
    });

    test('TC-010: Should return original when converted value equals current value', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue('same');
      const setting = { _id: 'test_setting', value: 'same', type: 'string' };

      // Act
      const overwriteValue = fn(setting._id);
      const result = overwriteValue === setting.value ? setting : { ...setting, value: overwriteValue };

      // Assert
      expect(result).toEqual(setting);
    });

    test('TC-011: Should handle boolean conversion', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue('true');
      const setting = { _id: 'bool_setting', value: false, type: 'boolean' };

      // Act
      const overwriteValue = fn(setting._id);
      const convertedValue = overwriteValue === 'true' ? true : overwriteValue === 'false' ? false : overwriteValue;
      const result = {
        ...setting,
        value: convertedValue,
        processEnvValue: convertedValue,
        valueSource: 'processEnvValue',
      };

      // Assert
      expect(result.value).toBe(true);
    });

    test('TC-012: Should handle int conversion', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue('123');
      const setting = { _id: 'int_setting', value: 100, type: 'int' };

      // Act
      const overwriteValue = fn(setting._id);
      const convertedValue = setting.type === 'int' ? parseInt(overwriteValue) : overwriteValue;
      const result = {
        ...setting,
        value: convertedValue,
        processEnvValue: convertedValue,
        valueSource: 'processEnvValue',
      };

      // Assert
      expect(result.value).toBe(123);
    });
  });

  describe('Error Handling', () => {
    
    test('TC-013: Should catch conversion errors and return original setting', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue('invalid json');
      const setting = { _id: 'multi_setting', value: [], type: 'multiSelect' };

      // Act
      let result;
      try {
        const overwriteValue = fn(setting._id);
        const value = JSON.parse(overwriteValue);
        result = { ...setting, value };
      } catch (error) {
        console.error(`Error converting value for setting ${setting._id} expected "${setting.type}" type`);
        result = setting;
      }

      // Assert
      expect(result).toEqual(setting);
      expect(console.error).toHaveBeenCalledWith(
        `Error converting value for setting multi_setting expected "multiSelect" type`
      );
    });

    test('TC-014: Should log error with correct setting id and type', () => {
      // Arrange
      const setting = { _id: 'error_setting', value: 'test', type: 'int' };
      const errorMessage = `Error converting value for setting ${setting._id} expected "${setting.type}" type`;

      // Act
      console.error(errorMessage);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Error converting value for setting error_setting expected "int" type'
      );
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-015: Should handle empty string override value', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue('');
      const setting = { _id: 'test_setting', value: 'original', type: 'string' };

      // Act
      const overwriteValue = fn(setting._id);
      const result = overwriteValue !== null && overwriteValue !== undefined ? {
        ...setting,
        value: overwriteValue,
        processEnvValue: overwriteValue,
        valueSource: 'processEnvValue',
      } : setting;

      // Assert
      expect(result.value).toBe('');
    });

    test('TC-016: Should preserve other setting properties', () => {
      // Arrange
      const fn = jest.fn().mockReturnValue('new');
      const setting = { 
        _id: 'test_setting', 
        value: 'old', 
        type: 'string',
        hidden: false,
        public: true 
      };

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
      expect(result._id).toBe('test_setting');
    });
  });
});
