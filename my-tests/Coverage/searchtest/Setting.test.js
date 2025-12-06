const { Setting, mockSettings } = require('../src/search/Setting');

describe('Setting - White-Box Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-SET-001: should create setting with all parameters', () => {
    const setting = new Setting('provider', 'key1', 'string', 'default', { opt: 1 });
    expect(setting.key).toBe('key1');
    expect(setting.type).toBe('string');
    expect(setting.defaultValue).toBe('default');
  });

  test('TC-SET-002: should generate correct id', () => {
    const setting = new Setting('myProvider', 'myKey', 'string', 'default');
    expect(setting.id).toBe('Search.myProvider.myKey');
  });

  test('TC-SET-003: should return undefined value initially', () => {
    const setting = new Setting('provider', 'key1', 'string', 'default');
    expect(setting.value).toBeUndefined();
  });

  test('TC-SET-004: should load value from settings', () => {
    mockSettings.get.mockReturnValue('loaded_value');
    const setting = new Setting('provider', 'key1', 'string', 'default');
    setting.load();
    expect(setting.value).toBe('loaded_value');
  });

  test('TC-SET-005: should use default value if settings returns undefined', () => {
    mockSettings.get.mockReturnValue(undefined);
    const setting = new Setting('provider', 'key1', 'string', 'default_val');
    setting.load();
    expect(setting.value).toBe('default_val');
  });

  test('TC-SET-006: should handle empty options', () => {
    const setting = new Setting('provider', 'key1', 'string', 'default');
    expect(setting.options).toEqual({});
  });

  test('TC-SET-007: should store custom options', () => {
    const opts = { min: 1, max: 10 };
    const setting = new Setting('provider', 'key1', 'int', 5, opts);
    expect(setting.options).toEqual(opts);
  });

  test('TC-SET-008: should handle boolean default value', () => {
    const setting = new Setting('provider', 'enabled', 'boolean', true);
    expect(setting.defaultValue).toBe(true);
  });

  test('TC-SET-009: should handle number default value', () => {
    const setting = new Setting('provider', 'count', 'int', 42);
    expect(setting.defaultValue).toBe(42);
  });

  test('TC-SET-010: should call settings.get with correct id on load', () => {
    const setting = new Setting('provider', 'key1', 'string', 'default');
    setting.load();
    expect(mockSettings.get).toHaveBeenCalledWith('Search.provider.key1');
  });
});
