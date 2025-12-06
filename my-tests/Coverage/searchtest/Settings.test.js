const { Settings } = require('../src/search/Settings');
const { mockSettings } = require('../src/search/Setting');

describe('Settings - White-Box Testing', () => {
  let settings;

  beforeEach(() => {
    jest.clearAllMocks();
    settings = new Settings('testProvider');
  });

  test('TC-SETS-001: should create settings with basekey', () => {
    expect(settings.basekey).toBe('testProvider');
  });

  test('TC-SETS-002: should add setting to settings object', () => {
    settings.add('key1', 'string', 'default', {});
    expect(settings.settings['key1']).toBeDefined();
  });

  test('TC-SETS-003: should list all settings', () => {
    settings.add('key1', 'string', 'val1', {});
    settings.add('key2', 'int', 10, {});
    const list = settings.list();
    expect(list.length).toBe(2);
  });

  test('TC-SETS-004: should return settings as map', () => {
    settings.add('key1', 'string', 'val1', {});
    const map = settings.map();
    expect(map['key1']).toBeDefined();
  });

  test('TC-SETS-005: should get setting value by key', () => {
    mockSettings.get.mockReturnValue('test_value');
    settings.add('key1', 'string', 'default', {});
    settings.load();
    expect(settings.get('key1')).toBe('test_value');
  });

  test('TC-SETS-006: should throw error if setting not found', () => {
    expect(() => settings.get('nonexistent')).toThrow('Setting is not set');
  });

  test('TC-SETS-007: should load all settings', () => {
    settings.add('key1', 'string', 'val1', {});
    settings.add('key2', 'int', 10, {});
    settings.load();
    expect(mockSettings.get).toHaveBeenCalledTimes(2);
  });

  test('TC-SETS-008: should handle empty settings', () => {
    const list = settings.list();
    expect(list.length).toBe(0);
  });

  test('TC-SETS-009: should add multiple settings', () => {
    settings.add('key1', 'string', 'val1', {});
    settings.add('key2', 'int', 10, {});
    settings.add('key3', 'boolean', true, {});
    expect(Object.keys(settings.settings).length).toBe(3);
  });

  test('TC-SETS-010: should override setting with same key', () => {
    settings.add('key1', 'string', 'val1', {});
    settings.add('key1', 'int', 20, {});
    expect(settings.settings['key1'].type).toBe('int');
  });
});
