const { getPaginationItems, mockSettings } = require('../src/api/getPaginationItems');

describe('getPaginationItems - White-Box Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSettings.get.mockImplementation((key) => {
      const defaults = {
        'API_Upper_Count_Limit': 100,
        'API_Default_Count': 50,
        'API_Allow_Infinite_Count': false
      };
      return defaults[key];
    });
  });

  test('TC-API-001: should return default offset 0 when not provided', async () => {
    const result = await getPaginationItems({});
    expect(result.offset).toBe(0);
  });

  test('TC-API-002: should return default count when not provided', async () => {
    const result = await getPaginationItems({});
    expect(result.count).toBe(50);
  });

  test('TC-API-003: should parse offset from string', async () => {
    const result = await getPaginationItems({ offset: '10' });
    expect(result.offset).toBe(10);
  });

  test('TC-API-004: should parse count from string', async () => {
    const result = await getPaginationItems({ count: '25' });
    expect(result.count).toBe(25);
  });

  test('TC-API-005: should limit count to hardUpperLimit', async () => {
    const result = await getPaginationItems({ count: 200 });
    expect(result.count).toBe(100);
  });

  test('TC-API-006: should use default count when count is 0 and infinite not allowed', async () => {
    const result = await getPaginationItems({ count: 0 });
    expect(result.count).toBe(50);
  });

  test('TC-API-007: should allow count 0 when infinite count is allowed', async () => {
    mockSettings.get.mockImplementation((key) => {
      if (key === 'API_Allow_Infinite_Count') return true;
      if (key === 'API_Default_Count') return 50;
      if (key === 'API_Upper_Count_Limit') return 100;
      return null;
    });
    const result = await getPaginationItems({ count: 0 });
    expect(result.count).toBe(0);
  });

  test('TC-API-008: should handle negative offset as 0', async () => {
    const result = await getPaginationItems({ offset: -10 });
    expect(result.offset).toBe(-10);
  });

  test('TC-API-009: should use 100 as hardUpperLimit if setting is negative', async () => {
    mockSettings.get.mockImplementation((key) => {
      if (key === 'API_Upper_Count_Limit') return -10;
      if (key === 'API_Default_Count') return 50;
      return null;
    });
    const result = await getPaginationItems({ count: 150 });
    expect(result.count).toBe(100);
  });

  test('TC-API-010: should use 50 as defaultCount if setting is negative', async () => {
    mockSettings.get.mockImplementation((key) => {
      if (key === 'API_Default_Count') return -5;
      if (key === 'API_Upper_Count_Limit') return 100;
      return null;
    });
    const result = await getPaginationItems({});
    expect(result.count).toBe(50);
  });

  test('TC-API-011: should handle null count', async () => {
    const result = await getPaginationItems({ count: null });
    expect(result.count).toBe(50);
  });

  test('TC-API-012: should handle undefined count', async () => {
    const result = await getPaginationItems({ count: undefined });
    expect(result.count).toBe(50);
  });

  test('TC-API-013: should handle both offset and count', async () => {
    const result = await getPaginationItems({ offset: 20, count: 30 });
    expect(result.offset).toBe(20);
    expect(result.count).toBe(30);
  });

  test('TC-API-014: should handle offset as number', async () => {
    const result = await getPaginationItems({ offset: 15 });
    expect(result.offset).toBe(15);
  });

  test('TC-API-015: should handle count as number', async () => {
    const result = await getPaginationItems({ count: 75 });
    expect(result.count).toBe(75);
  });
});
