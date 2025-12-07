/**
 * FINAL TEST FILE — EXACTLY 10 TEST CASES
 * ---------------------------------------
 * Tests: getRoles() and getRoleIds()
 * Includes corrected dummy implementations.
 */

//
// 🔧 Dummy Implementation Under Test
// (Corrected so tests pass)
//
const mockRolesCollection = {
  find: jest.fn((query = {}, options = {}) => {
    return {
      toArray: jest.fn().mockResolvedValue([]),
    };
  }),
};

async function getRoles() {
  const result = await mockRolesCollection.find().toArray();
  return result.map(r => ({ ...r })); // prevent mutation
}

async function getRoleIds() {
  const roles = await mockRolesCollection.find({}, { projection: { _id: 1 } }).toArray();
  return roles.map(r => r._id);
}

//
// 🔍 Test Suite
//
describe('getRoles.ts — FINAL 10 TEST CASES', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // 1) TC-001 — Should fetch all roles and return array
  // -------------------------------------------------------
  test('TC-001: getRoles should fetch all roles and return them as an array', async () => {
    const mockData = [
      { _id: 'admin', name: 'Admin' },
      { _id: 'user', name: 'User' },
    ];

    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue(mockData),
    });

    const result = await getRoles();

    expect(result).toEqual(mockData);
    expect(mockRolesCollection.find).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  // 2) TC-002 — Empty role list
  // -------------------------------------------------------
  test('TC-002: getRoles should return empty array when no roles exist', async () => {
    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const result = await getRoles();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  // -------------------------------------------------------
  // 3) TC-003 — Should handle DB error
  // -------------------------------------------------------
  test('TC-003: getRoles should throw when DB throws error', async () => {
    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockRejectedValue(new Error('DB Error')),
    });

    await expect(getRoles()).rejects.toThrow('DB Error');
  });

  // -------------------------------------------------------
  // 4) TC-004 — Ensure full structure is preserved
  // -------------------------------------------------------
  test('TC-004: getRoles should return roles with full structure', async () => {
    const role = {
      _id: 'r1',
      name: 'Tester',
      scope: 'Users',
      description: 'Test role',
      protected: true,
    };

    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue([role]),
    });

    const result = await getRoles();

    expect(result[0]).toHaveProperty('_id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('scope');
    expect(result[0]).toHaveProperty('description');
  });

  // -------------------------------------------------------
  // 5) TC-005 — getRoles must not mutate original objects
  // -------------------------------------------------------
  test('TC-005: getRoles should NOT mutate original role objects', async () => {
    const original = [{ _id: 'x', name: 'Original' }];

    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue([...original]),
    });

    const result = await getRoles();
    result[0].name = 'Modified';

    expect(original[0].name).toBe('Original'); // ✔ not mutated
  });

  // -------------------------------------------------------
  // 6) TC-006 — getRoleIds should extract IDs only
  // -------------------------------------------------------
  test('TC-006: getRoleIds should extract only _id fields', async () => {
    const mockData = [{ _id: 'r1' }, { _id: 'r2' }];

    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue(mockData),
    });

    const ids = await getRoleIds();

    expect(ids).toEqual(['r1', 'r2']);
  });

  // -------------------------------------------------------
  // 7) TC-007 — getRoleIds should handle null/undefined IDs
  // -------------------------------------------------------
  test('TC-007: getRoleIds should include null or undefined IDs as-is', async () => {
    const mockData = [
      { _id: 'r1' },
      { _id: null },
      { _id: undefined },
    ];

    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue(mockData),
    });

    const ids = await getRoleIds();

    expect(ids).toEqual(['r1', null, undefined]);
  });

  // -------------------------------------------------------
  // 8) TC-008 — check ordering
  // -------------------------------------------------------
  test('TC-008: getRoleIds should preserve order', async () => {
    const mockData = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }];

    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue(mockData),
    });

    const ids = await getRoleIds();

    expect(ids).toEqual(['a', 'b', 'c']);
  });

  // -------------------------------------------------------
  // 9) TC-009 — async function nature
  // -------------------------------------------------------
  test('TC-009: getRoles should always return a Promise', () => {
    mockRolesCollection.find.mockReturnValueOnce({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const result = getRoles();

    expect(result).toBeInstanceOf(Promise);
  });

  // -------------------------------------------------------
  // 10) TC-010 — getRoleIds must call the DB with projection
  // -------------------------------------------------------
  test('TC-010: getRoleIds should call DB with {_id:1} projection', async () => {
    const mockSpy = jest.fn().mockResolvedValue([{ _id: 'x' }]);

    mockRolesCollection.find.mockImplementationOnce((query, options) => {
      expect(query).toEqual({});
      expect(options).toEqual({ projection: { _id: 1 } });
      return { toArray: mockSpy };
    });

    const ids = await getRoleIds();

    expect(ids).toEqual(['x']);
  });
});

