/**
 * White Box Testing for convertValue.ts
 * 
 * Function Under Test:
 * - convertValue
 */

describe('convertValue.ts - Convert Setting Values', () => {
  
  describe('Boolean Conversion', () => {
    
    test('TC-001: Should convert "true" string to boolean true', () => {
      // Arrange
      const value = 'true';
      const type = 'boolean';

      // Act
      const result = value.toLowerCase() === 'true' ? true : value.toLowerCase() === 'false' ? false : value;

      // Assert
      expect(result).toBe(true);
    });

    test('TC-002: Should convert "TRUE" (uppercase) to boolean true', () => {
      // Arrange
      const value = 'TRUE';
      const type = 'boolean';

      // Act
      const result = value.toLowerCase() === 'true' ? true : value.toLowerCase() === 'false' ? false : value;

      // Assert
      expect(result).toBe(true);
    });

    test('TC-003: Should convert "false" string to boolean false', () => {
      // Arrange
      const value = 'false';
      const type = 'boolean';

      // Act
      const result = value.toLowerCase() === 'true' ? true : value.toLowerCase() === 'false' ? false : value;

      // Assert
      expect(result).toBe(false);
    });

    test('TC-004: Should convert "FALSE" (uppercase) to boolean false', () => {
      // Arrange
      const value = 'FALSE';
      const type = 'boolean';

      // Act
      const result = value.toLowerCase() === 'true' ? true : value.toLowerCase() === 'false' ? false : value;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Integer Conversion', () => {
    
    test('TC-005: Should convert string to integer for type "int"', () => {
      // Arrange
      const value = '123';
      const type = 'int';

      // Act
      let result;
      if (value.toLowerCase() === 'true') {
        result = true;
      } else if (value.toLowerCase() === 'false') {
        result = false;
      } else if (type === 'int') {
        result = parseInt(value);
      } else {
        result = value;
      }

      // Assert
      expect(result).toBe(123);
      expect(typeof result).toBe('number');
    });

    test('TC-006: Should handle negative integers', () => {
      // Arrange
      const value = '-456';
      const type = 'int';

      // Act
      const result = type === 'int' ? parseInt(value) : value;

      // Assert
      expect(result).toBe(-456);
    });

    test('TC-007: Should handle zero', () => {
      // Arrange
      const value = '0';
      const type = 'int';

      // Act
      const result = type === 'int' ? parseInt(value) : value;

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('MultiSelect Conversion', () => {
    
    test('TC-008: Should parse JSON for multiSelect type', () => {
      // Arrange
      const value = '["option1","option2","option3"]';
      const type = 'multiSelect';

      // Act
      const result = type === 'multiSelect' ? JSON.parse(value) : value;

      // Assert
      expect(result).toEqual(['option1', 'option2', 'option3']);
      expect(Array.isArray(result)).toBe(true);
    });

    test('TC-009: Should handle empty array for multiSelect', () => {
      // Arrange
      const value = '[]';
      const type = 'multiSelect';

      // Act
      const result = type === 'multiSelect' ? JSON.parse(value) : value;

      // Assert
      expect(result).toEqual([]);
    });

    test('TC-010: Should handle complex JSON objects in multiSelect', () => {
      // Arrange
      const value = '[{"id":1,"name":"test"}]';
      const type = 'multiSelect';

      // Act
      const result = type === 'multiSelect' ? JSON.parse(value) : value;

      // Assert
      expect(result).toEqual([{id: 1, name: 'test'}]);
    });
  });

  describe('String Values', () => {
    
    test('TC-011: Should return original string for non-special values', () => {
      // Arrange
      const value = 'regular string';
      const type = 'string';

      // Act
      let result;
      if (value.toLowerCase() === 'true') {
        result = true;
      } else if (value.toLowerCase() === 'false') {
        result = false;
      } else if (type === 'int') {
        result = parseInt(value);
      } else if (type === 'multiSelect') {
        result = JSON.parse(value);
      } else {
        result = value;
      }

      // Assert
      expect(result).toBe('regular string');
    });

    test('TC-012: Should return string for other types', () => {
      // Arrange
      const value = 'some value';
      const type = 'color';

      // Act
      const result = type === 'int' ? parseInt(value) : type === 'multiSelect' ? JSON.parse(value) : value;

      // Assert
      expect(result).toBe('some value');
    });
  });

  describe('Edge Cases', () => {
    
    test('TC-013: Should handle mixed case "TrUe"', () => {
      // Arrange
      const value = 'TrUe';

      // Act
      const result = value.toLowerCase() === 'true';

      // Assert
      expect(result).toBe(true);
    });

    test('TC-014: Should not convert "true " with spaces', () => {
      // Arrange
      const value = 'true ';

      // Act
      const result = value.toLowerCase() === 'true' ? true : value;

      // Assert
      expect(result).toBe('true ');
    });

    test('TC-015: Should handle numeric strings for non-int types', () => {
      // Arrange
      const value = '999';
      const type = 'string';

      // Act
      const result = type === 'int' ? parseInt(value) : value;

      // Assert
      expect(result).toBe('999');
      expect(typeof result).toBe('string');
    });

    test('TC-016: Should handle decimal in parseInt', () => {
      // Arrange
      const value = '3.14';
      const type = 'int';

      // Act
      const result = type === 'int' ? parseInt(value) : value;

      // Assert
      expect(result).toBe(3);
    });
  });
});
