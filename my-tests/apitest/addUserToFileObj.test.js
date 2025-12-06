const { addUserToFileObj, mockUsers } = require('../src/api/addUserToFileObj');

describe('addUserToFileObj - White-Box Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsers.findByIds.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });
  });

  test('TC-FILE-001: should return files unchanged when no users found', async () => {
    const files = [{ _id: 'file1', userId: 'user1' }];
    const result = await addUserToFileObj(files);
    expect(result).toEqual(files);
  });

  test('TC-FILE-002: should add user to file when user found', async () => {
    const files = [{ _id: 'file1', userId: 'user1' }];
    const users = [{ _id: 'user1', username: 'testuser', name: 'Test' }];
    mockUsers.findByIds.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(users)
    });

    const result = await addUserToFileObj(files);
    expect(result[0].user).toEqual(users[0]);
  });

  test('TC-FILE-003: should filter out non-string userIds', async () => {
    const files = [
      { _id: 'file1', userId: 'user1' },
      { _id: 'file2', userId: null },
      { _id: 'file3', userId: undefined }
    ];
    
    await addUserToFileObj(files);
    expect(mockUsers.findByIds).toHaveBeenCalledWith(['user1'], expect.any(Object));
  });

  test('TC-FILE-004: should handle empty files array', async () => {
    const result = await addUserToFileObj([]);
    expect(result).toEqual([]);
  });

  test('TC-FILE-005: should handle multiple files', async () => {
    const files = [
      { _id: 'file1', userId: 'user1' },
      { _id: 'file2', userId: 'user2' }
    ];
    const users = [
      { _id: 'user1', username: 'user1name' },
      { _id: 'user2', username: 'user2name' }
    ];
    mockUsers.findByIds.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(users)
    });

    const result = await addUserToFileObj(files);
    expect(result[0].user).toEqual(users[0]);
    expect(result[1].user).toEqual(users[1]);
  });

  test('TC-FILE-006: should handle file without userId', async () => {
    const files = [{ _id: 'file1' }];
    const result = await addUserToFileObj(files);
    expect(result).toEqual(files);
  });

  test('TC-FILE-007: should preserve file properties', async () => {
    const files = [{ _id: 'file1', userId: 'user1', name: 'test.txt' }];
    const result = await addUserToFileObj(files);
    expect(result[0].name).toBe('test.txt');
  });

  test('TC-FILE-008: should handle user not found for specific file', async () => {
    const files = [
      { _id: 'file1', userId: 'user1' },
      { _id: 'file2', userId: 'user999' }
    ];
    const users = [{ _id: 'user1', username: 'testuser' }];
    mockUsers.findByIds.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(users)
    });

    const result = await addUserToFileObj(files);
    expect(result[0].user).toBeDefined();
    expect(result[1].user).toBeUndefined();
  });

  test('TC-FILE-009: should call findByIds with correct projection', async () => {
    const files = [{ _id: 'file1', userId: 'user1' }];
    await addUserToFileObj(files);
    expect(mockUsers.findByIds).toHaveBeenCalledWith(['user1'], { projection: { name: 1, username: 1 } });
  });

  test('TC-FILE-010: should return array of same length', async () => {
    const files = [
      { _id: 'file1', userId: 'user1' },
      { _id: 'file2', userId: 'user2' },
      { _id: 'file3', userId: 'user3' }
    ];
    const result = await addUserToFileObj(files);
    expect(result.length).toBe(files.length);
  });
});
