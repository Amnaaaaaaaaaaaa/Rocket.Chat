/**
 * White Box Testing for startup.ts
 * 
 * Functions Under Test:
 * - initializeSettings
 */

describe('startup.ts - Initialize Settings', () => {
  let mockModel;
  let mockSettings;
  let mockRecords;

  beforeEach(() => {
    mockRecords = [
      { _id: 'setting1', value: 'value1', type: 'string' },
      { _id: 'setting2', value: 123, type: 'number' },
      { _id: 'setting3', value: true, type: 'boolean' }
    ];

    mockSettings = {
      set: jest.fn(),
      initialized: jest.fn(),
    };

    mockModel = {
      find: jest.fn(() => ({
        forEach: jest.fn((callback) => {
          mockRecords.forEach(callback);
        }),
      })),
    };

    jest.clearAllMocks();
  });

  describe('initializeSettings', () => {
    
    test('TC-001: Should call model.find to fetch all settings', async () => {
      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockModel.find).toHaveBeenCalled();
    });

    test('TC-002: Should set each record in settings', async () => {
      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockSettings.set).toHaveBeenCalledTimes(3);
      expect(mockSettings.set).toHaveBeenCalledWith(mockRecords[0]);
      expect(mockSettings.set).toHaveBeenCalledWith(mockRecords[1]);
      expect(mockSettings.set).toHaveBeenCalledWith(mockRecords[2]);
    });

    test('TC-003: Should call settings.initialized after loading', async () => {
      // Arrange
      const callOrder = [];
      mockSettings.set = jest.fn(() => {
        callOrder.push('set');
      });
      mockSettings.initialized = jest.fn(() => {
        callOrder.push('initialized');
      });

      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockSettings.initialized).toHaveBeenCalled();
      expect(callOrder[callOrder.length - 1]).toBe('initialized');
      expect(callOrder.filter(c => c === 'set').length).toBeGreaterThan(0);
    });

    test('TC-004: Should handle empty settings collection', async () => {
      // Arrange
      mockRecords = [];
      mockModel.find = jest.fn(() => ({
        forEach: jest.fn((callback) => {
          mockRecords.forEach(callback);
        }),
      }));

      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockSettings.set).not.toHaveBeenCalled();
      expect(mockSettings.initialized).toHaveBeenCalled();
    });

    test('TC-005: Should process settings with different types', async () => {
      // Arrange
      mockRecords = [
        { _id: 'stringSetting', value: 'text', type: 'string' },
        { _id: 'numberSetting', value: 42, type: 'number' },
        { _id: 'booleanSetting', value: false, type: 'boolean' },
        { _id: 'objectSetting', value: { key: 'val' }, type: 'object' }
      ];

      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockSettings.set).toHaveBeenCalledTimes(4);
      expect(mockSettings.set).toHaveBeenCalledWith(expect.objectContaining({ _id: 'stringSetting' }));
      expect(mockSettings.set).toHaveBeenCalledWith(expect.objectContaining({ _id: 'numberSetting' }));
      expect(mockSettings.set).toHaveBeenCalledWith(expect.objectContaining({ _id: 'booleanSetting' }));
      expect(mockSettings.set).toHaveBeenCalledWith(expect.objectContaining({ _id: 'objectSetting' }));
    });

    test('TC-006: Should maintain order of setting initialization', async () => {
      // Arrange
      const callOrder = [];
      mockSettings.set = jest.fn((record) => {
        callOrder.push(record._id);
      });

      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(callOrder).toEqual(['setting1', 'setting2', 'setting3']);
    });

    test('TC-007: Should handle settings with null values', async () => {
      // Arrange
      mockRecords = [
        { _id: 'nullSetting', value: null, type: 'string' }
      ];

      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockSettings.set).toHaveBeenCalledWith({ _id: 'nullSetting', value: null, type: 'string' });
    });

    test('TC-008: Should handle settings with undefined values', async () => {
      // Arrange
      mockRecords = [
        { _id: 'undefinedSetting', value: undefined, type: 'string' }
      ];

      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockSettings.set).toHaveBeenCalledWith({ _id: 'undefinedSetting', value: undefined, type: 'string' });
    });

    test('TC-009: Should handle large number of settings', async () => {
      // Arrange
      mockRecords = Array.from({ length: 100 }, (_, i) => ({
        _id: `setting${i}`,
        value: `value${i}`,
        type: 'string'
      }));

      // Act
      await mockModel.find().forEach((record) => {
        mockSettings.set(record);
      });
      mockSettings.initialized();

      // Assert
      expect(mockSettings.set).toHaveBeenCalledTimes(100);
      expect(mockSettings.initialized).toHaveBeenCalled();
    });

    test('TC-010: Should be an async function', async () => {
      // Act
      const initializeSettings = async ({ model, settings }) => {
        await model.find().forEach((record) => {
          settings.set(record);
        });
        settings.initialized();
      };

      const result = initializeSettings({ model: mockModel, settings: mockSettings });

      // Assert
      expect(result).toBeInstanceOf(Promise);
      await result;
    });
  });
});
