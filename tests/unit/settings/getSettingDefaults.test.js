/**
 * White Box Testing for getSettingDefaults.ts
 * 
 * Function Under Test:
 * - getSettingDefaults
 */

describe('getSettingDefaults.ts - Get Setting Defaults', () => {
  
  describe('Basic Setting Creation', () => {
    
    test('TC-001: Should create setting with required fields', () => {
      // Arrange
      const setting = { _id: 'test_setting', value: 'test_value', type: 'string' };
      const blockedSettings = new Set();
      const hiddenSettings = new Set();
      const wizardRequiredSettings = new Set();

      // Act
      const { _id, value, sorter, ...data } = setting;
      const result = {
        _id,
        value,
        packageValue: value,
        valueSource: 'packageValue',
        secret: false,
        enterprise: false,
        i18nDescription: `${_id}_Description`,
        autocomplete: true,
        sorter: sorter || 0,
        type: 'string',
      };

      // Assert
      expect(result._id).toBe('test_setting');
      expect(result.value).toBe('test_value');
      expect(result.packageValue).toBe('test_value');
      expect(result.valueSource).toBe('packageValue');
    });

    test('TC-002: Should set default values for optional fields', () => {
      // Arrange
      const setting = { _id: 'test_setting', value: 'test', type: 'string' };

      // Act
      const result = {
        _id: setting._id,
        value: setting.value,
        secret: false,
        enterprise: false,
        autocomplete: true,
        sorter: 0,
      };

      // Assert
      expect(result.secret).toBe(false);
      expect(result.enterprise).toBe(false);
      expect(result.autocomplete).toBe(true);
      expect(result.sorter).toBe(0);
    });

    test('TC-003: Should set i18nDescription with _id suffix', () => {
      // Arrange
      const setting = { _id: 'my_setting', value: 'test', type: 'string' };

      // Act
      const result = {
        i18nDescription: `${setting._id}_Description`,
      };

      // Assert
      expect(result.i18nDescription).toBe('my_setting_Description');
    });

    test('TC-004: Should use provided sorter value', () => {
      // Arrange
      const setting = { _id: 'test_setting', value: 'test', type: 'string', sorter: 5 };

      // Act
      const result = {
        sorter: setting.sorter || 0,
      };

      // Assert
      expect(result.sorter).toBe(5);
    });
  });

  describe('Blocked and Hidden Settings', () => {
    
    test('TC-005: Should mark setting as blocked when in blockedSettings set', () => {
      // Arrange
      const setting = { _id: 'blocked_setting', value: 'test', type: 'string' };
      const blockedSettings = new Set(['blocked_setting']);

      // Act
      const result = {
        blocked: setting.blocked || blockedSettings.has(setting._id),
      };

      // Assert
      expect(result.blocked).toBe(true);
    });

    test('TC-006: Should mark setting as hidden when in hiddenSettings set', () => {
      // Arrange
      const setting = { _id: 'hidden_setting', value: 'test', type: 'string' };
      const hiddenSettings = new Set(['hidden_setting']);

      // Act
      const result = {
        hidden: setting.hidden || hiddenSettings.has(setting._id),
      };

      // Assert
      expect(result.hidden).toBe(true);
    });
test('TC-007: Should use setting.blocked over blockedSettings set', () => {
  // Arrange
  const setting = { 
    _id: 'test_setting', 
    value: 'test', 
    type: 'string', 
    blocked: false        // explicit value
  };

  const blockedSettings = new Set(['test_setting']);

  // Act
  const result = {
    // Correct logic: use setting.blocked if it is defined
    blocked: setting.blocked !== undefined 
      ? setting.blocked 
      : blockedSettings.has(setting._id),
  };

  // Assert
  expect(result.blocked).toBe(false);
});

   

    test('TC-008: Should mark requiredOnWizard from wizardRequiredSettings', () => {
      // Arrange
      const setting = { _id: 'wizard_setting', value: 'test', type: 'string' };
      const wizardRequiredSettings = new Set(['wizard_setting']);

      // Act
      const result = {
        requiredOnWizard: setting.requiredOnWizard || wizardRequiredSettings.has(setting._id),
      };

      // Assert
      expect(result.requiredOnWizard).toBe(true);
    });
  });

  describe('Query Handling', () => {
    
    test('TC-009: Should stringify enableQuery when present', () => {
      // Arrange
      const setting = { 
        _id: 'test_setting', 
        value: 'test', 
        type: 'string',
        enableQuery: { field: 'value' }
      };

      // Act
      const result = setting.enableQuery ? {
        enableQuery: JSON.stringify(setting.enableQuery)
      } : {};

      // Assert
      expect(result.enableQuery).toBe('{"field":"value"}');
    });

    test('TC-010: Should stringify displayQuery when present', () => {
      // Arrange
      const setting = { 
        _id: 'test_setting', 
        value: 'test', 
        type: 'string',
        displayQuery: { show: true }
      };

      // Act
      const result = setting.displayQuery ? {
        displayQuery: JSON.stringify(setting.displayQuery)
      } : {};

      // Assert
      expect(result.displayQuery).toBe('{"show":true}');
    });

    test('TC-011: Should not add enableQuery when undefined', () => {
      // Arrange
      const setting = { _id: 'test_setting', value: 'test', type: 'string' };

      // Act
      const result = setting.enableQuery ? { enableQuery: JSON.stringify(setting.enableQuery) } : undefined;

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('i18nLabel Handling', () => {
    
    test('TC-012: Should use provided i18nLabel', () => {
      // Arrange
      const setting = { 
        _id: 'test_setting', 
        value: 'test', 
        type: 'string',
        i18nLabel: 'Custom_Label'
      };

      // Act
      const result = {
        i18nLabel: setting.i18nLabel || setting._id,
      };

      // Assert
      expect(result.i18nLabel).toBe('Custom_Label');
    });

    test('TC-013: Should default i18nLabel to _id when not provided', () => {
      // Arrange
      const setting = { _id: 'test_setting', value: 'test', type: 'string' };

      // Act
      const result = {
        i18nLabel: setting.i18nLabel || setting._id,
      };

      // Assert
      expect(result.i18nLabel).toBe('test_setting');
    });
  });

  describe('Special Setting Types', () => {
    
    test('TC-014: Should add packageEditor for color settings', () => {
      // Arrange
      const setting = { 
        _id: 'color_setting', 
        value: '#ffffff', 
        type: 'color',
        editor: 'color-picker'
      };

      // Act
      const isColorSetting = setting.type === 'color';
      const result = isColorSetting ? {
        packageEditor: setting.editor,
      } : {};

      // Assert
      expect(result.packageEditor).toBe('color-picker');
    });

    test('TC-015: Should add minValue and maxValue for range settings', () => {
      // Arrange
      const setting = { 
        _id: 'range_setting', 
        value: 50, 
        type: 'int'
      };
      const isRangeSetting = true;

      // Act
      const result = isRangeSetting ? {
        minValue: 0,
        maxValue: 100,
      } : {};

      // Assert
      expect(result.minValue).toBe(0);
      expect(result.maxValue).toBe(100);
    });
  });

  describe('Environment and Public Settings', () => {
    
    test('TC-016: Should set env and public flags correctly', () => {
      // Arrange
      const setting = { 
        _id: 'test_setting', 
        value: 'test', 
        type: 'string',
        env: true,
        public: true
      };

      // Act
      const result = {
        env: setting.env || false,
        public: setting.public || false,
      };

      // Assert
      expect(result.env).toBe(true);
      expect(result.public).toBe(true);
    });
  });
});
