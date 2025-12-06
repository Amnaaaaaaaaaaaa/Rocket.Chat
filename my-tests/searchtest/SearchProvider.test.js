const { SearchProvider, mockLogger } = require('../src/search/SearchProvider');

describe('SearchProvider - White-Box Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-PROV-001: should create provider with valid key', () => {
    const provider = new SearchProvider('validKey123');
    expect(provider.key).toBe('validKey123');
  });

  test('TC-PROV-002: should throw error for invalid key with special chars', () => {
    expect(() => new SearchProvider('invalid-key')).toThrow('does not match key-pattern');
  });

  test('TC-PROV-003: should throw error for key with spaces', () => {
    expect(() => new SearchProvider('invalid key')).toThrow('does not match key-pattern');
  });

  test('TC-PROV-004: should log provider creation', () => {
    new SearchProvider('testKey');
    expect(mockLogger.info).toHaveBeenCalledWith('create search provider testKey');
  });

  test('TC-PROV-005: should return default icon name', () => {
    const provider = new SearchProvider('test');
    expect(provider.iconName).toBe('magnifier');
  });

  test('TC-PROV-006: should return default result template', () => {
    const provider = new SearchProvider('test');
    expect(provider.resultTemplate).toBe('DefaultSearchResultTemplate');
  });

  test('TC-PROV-007: should return default suggestion template', () => {
    const provider = new SearchProvider('test');
    expect(provider.suggestionItemTemplate).toBe('DefaultSuggestionItemTemplate');
  });

  test('TC-PROV-008: should have supportsSuggestions as false', () => {
    const provider = new SearchProvider('test');
    expect(provider.supportsSuggestions).toBe(false);
  });

  test('TC-PROV-009: should call callback with empty array in suggest', () => {
    const provider = new SearchProvider('test');
    const callback = jest.fn();
    provider.suggest('text', {}, {}, callback);
    expect(callback).toHaveBeenCalledWith(null, []);
  });

  test('TC-PROV-010: should return true in on method', () => {
    const provider = new SearchProvider('test');
    expect(provider.on('event', 'value')).toBe(true);
  });

  test('TC-PROV-011: should resolve in start method', async () => {
    const provider = new SearchProvider('test');
    const result = await new Promise((resolve) => provider.start('startup', resolve, jest.fn()));
    expect(result).toBeUndefined();
  });

  test('TC-PROV-012: should call stop resolve', async () => {
    const provider = new SearchProvider('test');
    const resolve = jest.fn();
    provider.stop(resolve);
    expect(resolve).toHaveBeenCalled();
  });

  test('TC-PROV-013: should run and load settings', async () => {
    const provider = new SearchProvider('test');
    await provider.run('startup');
    expect(provider._settings).toBeDefined();
  });

  test('TC-PROV-014: should accept alphanumeric keys', () => {
    const provider = new SearchProvider('Test123Provider');
    expect(provider.key).toBe('Test123Provider');
  });

  test('TC-PROV-015: should return settings list', () => {
    const provider = new SearchProvider('test');
    expect(Array.isArray(provider.settings)).toBe(true);
  });
});
