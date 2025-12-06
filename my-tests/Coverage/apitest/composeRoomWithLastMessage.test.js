const { composeRoomWithLastMessage, mockNormalizeMessagesForUser } = require('../src/api/composeRoomWithLastMessage');

describe('composeRoomWithLastMessage - White-Box Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNormalizeMessagesForUser.mockResolvedValue([{ _id: 'msg1', text: 'normalized' }]);
  });

  test('TC-COMP-001: should normalize last message if present', async () => {
    const room = { 
      _id: 'room1', 
      lastMessage: { _id: 'msg1', text: 'original' } 
    };
    
    const result = await composeRoomWithLastMessage(room, 'user123');
    
    expect(mockNormalizeMessagesForUser).toHaveBeenCalledWith(
      [{ _id: 'msg1', text: 'original' }], 
      'user123'
    );
    expect(result.lastMessage.text).toBe('normalized');
  });

  test('TC-COMP-002: should return room unchanged if no lastMessage', async () => {
    const room = { _id: 'room1' };
    
    const result = await composeRoomWithLastMessage(room, 'user123');
    
    expect(mockNormalizeMessagesForUser).not.toHaveBeenCalled();
    expect(result).toEqual(room);
  });

  test('TC-COMP-003: should handle null lastMessage', async () => {
    const room = { _id: 'room1', lastMessage: null };
    
    const result = await composeRoomWithLastMessage(room, 'user123');
    
    expect(mockNormalizeMessagesForUser).not.toHaveBeenCalled();
    expect(result.lastMessage).toBeNull();
  });

  test('TC-COMP-004: should handle undefined lastMessage', async () => {
    const room = { _id: 'room1', lastMessage: undefined };
    
    const result = await composeRoomWithLastMessage(room, 'user123');
    
    expect(mockNormalizeMessagesForUser).not.toHaveBeenCalled();
    expect(result.lastMessage).toBeUndefined();
  });

  test('TC-COMP-005: should pass userId to normalizer', async () => {
    const room = { lastMessage: { _id: 'msg1' } };
    
    await composeRoomWithLastMessage(room, 'user999');
    
    expect(mockNormalizeMessagesForUser).toHaveBeenCalledWith(
      expect.any(Array), 
      'user999'
    );
  });

  test('TC-COMP-006: should preserve other room properties', async () => {
    const room = { 
      _id: 'room1', 
      name: 'Test Room',
      type: 'c',
      lastMessage: { _id: 'msg1' } 
    };
    
    const result = await composeRoomWithLastMessage(room, 'user123');
    
    expect(result._id).toBe('room1');
    expect(result.name).toBe('Test Room');
    expect(result.type).toBe('c');
  });

  test('TC-COMP-007: should handle normalizer returning empty array', async () => {
    mockNormalizeMessagesForUser.mockResolvedValue([]);
    const room = { lastMessage: { _id: 'msg1' } };
    
    const result = await composeRoomWithLastMessage(room, 'user123');
    
    expect(result.lastMessage).toBeUndefined();
  });

  test('TC-COMP-008: should handle normalizer error', async () => {
    mockNormalizeMessagesForUser.mockRejectedValue(new Error('Normalize failed'));
    const room = { lastMessage: { _id: 'msg1' } };
    
    await expect(composeRoomWithLastMessage(room, 'user123')).rejects.toThrow('Normalize failed');
  });

  test('TC-COMP-009: should work with different userId types', async () => {
    const room = { lastMessage: { _id: 'msg1' } };
    
    await composeRoomWithLastMessage(room, 123);
    
    expect(mockNormalizeMessagesForUser).toHaveBeenCalledWith(expect.any(Array), 123);
  });

  test('TC-COMP-010: should handle complex message objects', async () => {
    const room = { 
      lastMessage: { 
        _id: 'msg1', 
        text: 'test',
        user: { _id: 'u1' },
        attachments: []
      } 
    };
    
    await composeRoomWithLastMessage(room, 'user123');
    
    expect(mockNormalizeMessagesForUser).toHaveBeenCalledWith(
      [expect.objectContaining({ _id: 'msg1', text: 'test' })],
      'user123'
    );
  });
});
