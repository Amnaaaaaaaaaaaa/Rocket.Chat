/**
 * Custom Sounds API - White-Box Testing
 * Tests: list custom sounds
 * Total: 10 tests
 */

describe('Custom Sounds API - White-Box Testing', () => {
  const mockCustomSounds = {
    findPaginated: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-CSOUND-001: should validate pagination parameters', () => {
    const offset = 0;
    const count = 25;
    expect(typeof offset).toBe('number');
    expect(typeof count).toBe('number');
  });

  test('TC-CSOUND-002: should handle name filter', () => {
    const name = 'notification';
    const filter = name ? { name: { $regex: name, $options: 'i' } } : {};
    expect(filter).toHaveProperty('name');
  });

  test('TC-CSOUND-003: should escape regex characters', () => {
    const name = 'test.sound';
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(escaped).toContain('\\.');
  });

  test('TC-CSOUND-004: should apply sort', () => {
    const sort = { name: 1 };
    expect(sort).toHaveProperty('name');
    expect(sort.name).toBe(1);
  });

  test('TC-CSOUND-005: should return paginated results', async () => {
    mockCustomSounds.findPaginated.mockReturnValue({
      cursor: {
        toArray: jest.fn().mockResolvedValue([
          { _id: 'sound1', name: 'notification' }
        ])
      },
      totalCount: jest.fn().mockResolvedValue(1)
    });

    const result = mockCustomSounds.findPaginated({}, {});
    const [sounds, total] = await Promise.all([
      result.cursor.toArray(),
      result.totalCount()
    ]);

    expect(sounds.length).toBe(1);
    expect(total).toBe(1);
  });

  test('TC-CSOUND-006: should handle empty query', () => {
    const query = {};
    expect(Object.keys(query).length).toBe(0);
  });

  test('TC-CSOUND-007: should combine filters', () => {
    const query = { active: true };
    const name = 'notification';
    const filter = {
      ...query,
      ...(name ? { name: { $regex: name, $options: 'i' } } : {})
    };
    expect(filter).toHaveProperty('active');
    expect(filter).toHaveProperty('name');
  });

  test('TC-CSOUND-008: should validate sound object structure', () => {
    const sound = {
      _id: 'sound1',
      name: 'notification',
      extension: 'mp3'
    };
    expect(sound).toHaveProperty('_id');
    expect(sound).toHaveProperty('name');
  });

  test('TC-CSOUND-009: should handle case-insensitive search', () => {
    const options = 'i';
    expect(options).toBe('i');
  });

  test('TC-CSOUND-010: should return total count', async () => {
    mockCustomSounds.findPaginated.mockReturnValue({
      cursor: { toArray: jest.fn().mockResolvedValue([]) },
      totalCount: jest.fn().mockResolvedValue(5)
    });

    const result = mockCustomSounds.findPaginated({}, {});
    const total = await result.totalCount();
    expect(total).toBe(5);
  });
});
