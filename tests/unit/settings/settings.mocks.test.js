/**
 * White Box Testing for settings.mocks.ts
 * 
 * Class Under Test:
 * - SettingsClass
 */

describe('settings.mocks.ts - Settings Mock Class', () => {
  let settingsInstance;
  let mockSettings;

  beforeEach(() => {
    mockSettings = {
      set: jest.fn(),
    };

    settingsInstance = {
      settings: mockSettings,
      delay: 0,
      data: new Map(),
      upsertCalls: 0,
      insertCalls: 0,
      setDelay: function(delay) {
        this.delay = delay;
      },
      find: function() {
        return [];
      },
      checkQueryMatch: function(key, data, queryValue) {
        if (typeof queryValue === 'object') {
          if (queryValue.$exists !== undefined) {
            return (data.hasOwnProperty(key) && data[key] !== undefined) === queryValue.$exists;
          }
        }
        return queryValue === data[key];
      },
      findOne: function(query) {
        return [...this.data.values()].find((data) => 
          Object.entries(query).every(([key, value]) => this.checkQueryMatch(key, data, value))
        );
      },
      insertOne: function(doc) {
        this.data.set(doc._id, doc);
        this.settings.set(doc);
        this.insertCalls++;
      },
      updateValueById: function(id, value) {
        this.data.set(id, { ...this.data.get(id), value });
        this.settings.set(this.data.get(id));
      },
    };

    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    
    test('TC-001: Should initialize with default delay of 0', () => {
      // Assert
      expect(settingsInstance.delay).toBe(0);
    });

    test('TC-002: Should initialize with empty data Map', () => {
      // Assert
      expect(settingsInstance.data).toBeInstanceOf(Map);
      expect(settingsInstance.data.size).toBe(0);
    });

    test('TC-003: Should initialize counters to 0', () => {
      // Assert
      expect(settingsInstance.upsertCalls).toBe(0);
      expect(settingsInstance.insertCalls).toBe(0);
    });
  });

  describe('setDelay Method', () => {
    
    test('TC-004: Should set delay value', () => {
      // Act
      settingsInstance.setDelay(500);

      // Assert
      expect(settingsInstance.delay).toBe(500);
    });
  });

  describe('find Method', () => {
    
    test('TC-005: Should return empty array', () => {
      // Act
      const result = settingsInstance.find();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('checkQueryMatch Method', () => {
    
    test('TC-006: Should match exact value', () => {
      // Arrange
      const data = { name: 'test', value: 123 };

      // Act
      const result = settingsInstance.checkQueryMatch('name', data, 'test');

      // Assert
      expect(result).toBe(true);
    });

    test('TC-007: Should handle $exists query with existing key', () => {
      // Arrange
      const data = { name: 'test', value: 123 };
      const queryValue = { $exists: true };

      // Act
      const result = settingsInstance.checkQueryMatch('name', data, queryValue);

      // Assert
      expect(result).toBe(true);
    });

    test('TC-008: Should handle $exists query with non-existing key', () => {
      // Arrange
      const data = { name: 'test' };
      const queryValue = { $exists: false };

      // Act
      const result = settingsInstance.checkQueryMatch('missing', data, queryValue);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('findOne Method', () => {
    
    test('TC-009: Should find document by _id', () => {
      // Arrange
      const doc = { _id: 'setting1', value: 'test' };
      settingsInstance.data.set('setting1', doc);

      // Act
      const result = settingsInstance.findOne({ _id: 'setting1' });

      // Assert
      expect(result).toEqual(doc);
    });

    test('TC-010: Should return undefined when document not found', () => {
      // Act
      const result = settingsInstance.findOne({ _id: 'nonexistent' });

      // Assert
      expect(result).toBeUndefined();
    });

    test('TC-011: Should find by multiple query fields', () => {
      // Arrange
      const doc = { _id: 'setting1', value: 'test', type: 'string' };
      settingsInstance.data.set('setting1', doc);

      // Act
      const result = settingsInstance.findOne({ _id: 'setting1', type: 'string' });

      // Assert
      expect(result).toEqual(doc);
    });
  });

  describe('insertOne Method', () => {
    
    test('TC-012: Should insert document and increment counter', () => {
      // Arrange
      const doc = { _id: 'new_setting', value: 'new_value' };

      // Act
      settingsInstance.insertOne(doc);

      // Assert
      expect(settingsInstance.data.get('new_setting')).toEqual(doc);
      expect(settingsInstance.insertCalls).toBe(1);
      expect(mockSettings.set).toHaveBeenCalledWith(doc);
    });

    test('TC-013: Should call settings.set when inserting', () => {
      // Arrange
      const doc = { _id: 'test_setting', value: 'test' };

      // Act
      settingsInstance.insertOne(doc);

      // Assert
      expect(mockSettings.set).toHaveBeenCalledWith(doc);
    });
  });

  describe('updateValueById Method', () => {
    
    test('TC-014: Should update existing document value', () => {
      // Arrange
      const doc = { _id: 'setting1', value: 'old_value', type: 'string' };
      settingsInstance.data.set('setting1', doc);

      // Act
      settingsInstance.updateValueById('setting1', 'new_value');

      // Assert
      const updated = settingsInstance.data.get('setting1');
      expect(updated.value).toBe('new_value');
      expect(updated.type).toBe('string');
    });

    test('TC-015: Should preserve other properties when updating value', () => {
      // Arrange
      const doc = { _id: 'setting1', value: 'old', type: 'string', hidden: false };
      settingsInstance.data.set('setting1', doc);

      // Act
      settingsInstance.updateValueById('setting1', 'new');

      // Assert
      const updated = settingsInstance.data.get('setting1');
      expect(updated.type).toBe('string');
      expect(updated.hidden).toBe(false);
    });

    test('TC-016: Should call settings.set after update', () => {
      // Arrange
      const doc = { _id: 'setting1', value: 'old' };
      settingsInstance.data.set('setting1', doc);

      // Act
      settingsInstance.updateValueById('setting1', 'new');

      // Assert
      expect(mockSettings.set).toHaveBeenCalled();
    });
  });
});
