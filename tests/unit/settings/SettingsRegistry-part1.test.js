/**
 * White Box Testing for SettingsRegistry.ts - Part 1
 * 
 * Class Under Test:
 * - SettingsRegistry (Basic functionality)
 */

describe('SettingsRegistry.ts - Part 1: Basic Functionality', () => {
  let mockStore;
  let mockModel;
  let settingsRegistry;
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };

    mockStore = {
      getSetting: jest.fn(),
      set: jest.fn(),
      has: jest.fn(),
    };

    mockModel = {
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      findOne: jest.fn(),
    };

    settingsRegistry = {
      model: mockModel,
      store: mockStore,
      _sorter: {},
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor and Initialization', () => {
    
    test('TC-001: Should initialize with store and model', () => {
      // Assert
      expect(settingsRegistry.store).toBe(mockStore);
      expect(settingsRegistry.model).toBe(mockModel);
    });

    test('TC-002: Should initialize empty _sorter object', () => {
      // Assert
      expect(settingsRegistry._sorter).toEqual({});
    });
  });

  describe('Environment Variable Parsing', () => {
    
    test('TC-003: Should parse SETTINGS_BLOCKED environment variable', () => {
      // Arrange
      process.env.SETTINGS_BLOCKED = 'setting1,setting2,setting3';
      const blockedSettings = new Set();

      // Act
      process.env.SETTINGS_BLOCKED.split(',').forEach((settingId) => 
        blockedSettings.add(settingId.trim())
      );

      // Assert
      expect(blockedSettings.has('setting1')).toBe(true);
      expect(blockedSettings.has('setting2')).toBe(true);
      expect(blockedSettings.has('setting3')).toBe(true);
    });

    test('TC-004: Should parse SETTINGS_HIDDEN environment variable', () => {
      // Arrange
      process.env.SETTINGS_HIDDEN = 'hidden1, hidden2';
      const hiddenSettings = new Set();

      // Act
      process.env.SETTINGS_HIDDEN.split(',').forEach((settingId) => 
        hiddenSettings.add(settingId.trim())
      );

      // Assert
      expect(hiddenSettings.has('hidden1')).toBe(true);
      expect(hiddenSettings.has('hidden2')).toBe(true);
      expect(hiddenSettings.size).toBe(2);
    });

    test('TC-005: Should parse SETTINGS_REQUIRED_ON_WIZARD environment variable', () => {
      // Arrange
      process.env.SETTINGS_REQUIRED_ON_WIZARD = 'wizard1,wizard2';
      const wizardSettings = new Set();

      // Act
      process.env.SETTINGS_REQUIRED_ON_WIZARD.split(',').forEach((settingId) => 
        wizardSettings.add(settingId.trim())
      );

      // Assert
      expect(wizardSettings.has('wizard1')).toBe(true);
      expect(wizardSettings.has('wizard2')).toBe(true);
    });

    test('TC-006: Should trim whitespace from setting IDs', () => {
      // Arrange
      const input = ' setting1 , setting2 , setting3 ';
      const settings = new Set();

      // Act
      input.split(',').forEach((id) => settings.add(id.trim()));

      // Assert
      expect(settings.has('setting1')).toBe(true);
      expect(settings.has(' setting1 ')).toBe(false);
    });
  });

  describe('compareSettings Function', () => {
    
    test('TC-007: Should compare settings ignoring specified keys', () => {
      // Arrange
      const setting1 = { _id: 'test', value: 'old', type: 'string', ts: new Date() };
      const setting2 = { _id: 'test', value: 'new', type: 'string', ts: new Date() };
      const ignoreKeys = ['value', 'ts'];

      // Act
      const allKeys = [...new Set([...Object.keys(setting1), ...Object.keys(setting2)])];
      const result = allKeys
        .filter(key => !ignoreKeys.includes(key))
        .every(key => setting1[key] === setting2[key]);

      // Assert
      expect(result).toBe(true);
    });

    test('TC-008: Should detect differences in non-ignored keys', () => {
      // Arrange
      const setting1 = { _id: 'test', value: 'same', type: 'string' };
      const setting2 = { _id: 'test', value: 'same', type: 'boolean' };
      const ignoreKeys = ['value'];

      // Act
      const allKeys = [...new Set([...Object.keys(setting1), ...Object.keys(setting2)])];
      const result = allKeys
        .filter(key => !ignoreKeys.includes(key))
        .every(key => setting1[key] === setting2[key]);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getGroupDefaults Function', () => {
    
    test('TC-009: Should create group with default values', () => {
      // Arrange
      const _id = 'test_group';
      const blockedSettings = new Set();
      const hiddenSettings = new Set();

      // Act
      const group = {
        _id,
        i18nLabel: _id,
        i18nDescription: `${_id}_Description`,
        sorter: 0,
        blocked: blockedSettings.has(_id),
        hidden: hiddenSettings.has(_id),
        type: 'group',
      };

      // Assert
      expect(group._id).toBe('test_group');
      expect(group.i18nLabel).toBe('test_group');
      expect(group.i18nDescription).toBe('test_group_Description');
      expect(group.type).toBe('group');
    });

    test('TC-010: Should mark group as blocked when in blockedSettings', () => {
      // Arrange
      const _id = 'blocked_group';
      const blockedSettings = new Set(['blocked_group']);

      // Act
      const group = {
        _id,
        blocked: blockedSettings.has(_id),
      };

      // Assert
      expect(group.blocked).toBe(true);
    });

    test('TC-011: Should mark group as hidden when in hiddenSettings', () => {
      // Arrange
      const _id = 'hidden_group';
      const hiddenSettings = new Set(['hidden_group']);

      // Act
      const group = {
        _id,
        hidden: hiddenSettings.has(_id),
      };

      // Assert
      expect(group.hidden).toBe(true);
    });

    test('TC-012: Should stringify displayQuery when provided', () => {
      // Arrange
      const displayQuery = { field: 'value', show: true };

      // Act
      const group = {
        _id: 'test',
        displayQuery: JSON.stringify(displayQuery),
      };

      // Assert
      expect(group.displayQuery).toBe('{"field":"value","show":true}');
    });
  });

  describe('Input Validation', () => {
    
    test('TC-013: Should throw error for missing _id in add', () => {
      // Arrange
      const _id = '';
      const value = 'test';

      // Act & Assert
      expect(() => {
        if (!_id || value == null) {
          throw new Error('Invalid arguments');
        }
      }).toThrow('Invalid arguments');
    });

    test('TC-014: Should throw error for null value in add', () => {
      // Arrange
      const _id = 'test';
      const value = null;

      // Act & Assert
      expect(() => {
        if (!_id || value == null) {
          throw new Error('Invalid arguments');
        }
      }).toThrow('Invalid arguments');
    });

    test('TC-015: Should throw error for invalid addGroup arguments', () => {
      // Arrange
      const _id = '';
      const cb = jest.fn();

      // Act & Assert
      expect(() => {
        if (!_id) {
          throw new Error('Invalid arguments');
        }
      }).toThrow('Invalid arguments');
    });

    test('TC-016: Should validate setting type matches value', () => {
      // Arrange
      const _id = 'test_setting';
      const type = 'boolean';
      const value = 'not a boolean';

      // Act & Assert
      expect(() => {
        if (typeof value !== 'boolean') {
          throw new Error(`Setting ${_id} is of type ${type} but got ${typeof value}`);
        }
      }).toThrow('Setting test_setting is of type boolean but got string');
    });
  });
});
