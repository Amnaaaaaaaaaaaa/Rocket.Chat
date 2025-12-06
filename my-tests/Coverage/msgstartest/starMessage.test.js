const { starMessage } = require('./starMessage');
const { Messages, Subscriptions, Rooms } = require('../mocks/models');
const { settings } = require('../mocks/settings');
const { canAccessRoomAsync } = require('../mocks/authorization');
const { isTheLastMessage } = require('../mocks/utils');

describe('starMessage - White-Box Testing', () => {
  const mockUserId = 'user123';
  const mockMessage = { 
    _id: 'msg123', 
    rid: 'room123',
    starred: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    settings.get.mockImplementation((key) => {
      if (key === 'Message_AllowStarring') return true;
      return null;
    });
    
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue({ _id: 'sub123' });
    Messages.findOneByRoomIdAndMessageId.mockResolvedValue({ _id: 'msg123' });
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    canAccessRoomAsync.mockResolvedValue(true);
    isTheLastMessage.mockReturnValue(false);
  });

  // STARRING NOT ALLOWED TESTS
  test('TC-STAR-001: should throw error if starring not allowed', async () => {
    settings.get.mockReturnValue(false);

    await expect(
      starMessage(mockUserId, mockMessage)
    ).rejects.toThrow('Message starring not allowed');
  });

  // SUBSCRIPTION TESTS
  test('TC-STAR-002: should return false if no subscription found', async () => {
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue(null);

    const result = await starMessage(mockUserId, mockMessage);

    expect(result).toBe(false);
  });

  test('TC-STAR-003: should check subscription with correct parameters', async () => {
    await starMessage(mockUserId, mockMessage);

    expect(Subscriptions.findOneByRoomIdAndUserId).toHaveBeenCalledWith(
      'room123',
      'user123',
      { projection: { _id: 1 } }
    );
  });

  // MESSAGE EXISTENCE TESTS
  test('TC-STAR-004: should return false if message not found', async () => {
    Messages.findOneByRoomIdAndMessageId.mockResolvedValue(null);

    const result = await starMessage(mockUserId, mockMessage);

    expect(result).toBe(false);
  });

  test('TC-STAR-005: should verify message exists in room', async () => {
    await starMessage(mockUserId, mockMessage);

    expect(Messages.findOneByRoomIdAndMessageId).toHaveBeenCalledWith(
      'room123',
      'msg123'
    );
  });

  // ROOM ACCESS TESTS
  test('TC-STAR-006: should throw error if room not found', async () => {
    Rooms.findOneById.mockResolvedValue(null);

    await expect(
      starMessage(mockUserId, mockMessage)
    ).rejects.toThrow('Not allowed');
  });

  test('TC-STAR-007: should throw error if user cannot access room', async () => {
    canAccessRoomAsync.mockResolvedValue(false);

    await expect(
      starMessage(mockUserId, mockMessage)
    ).rejects.toThrow('Not Authorized');
  });

  test('TC-STAR-008: should check room access with correct parameters', async () => {
    await starMessage(mockUserId, mockMessage);

    expect(canAccessRoomAsync).toHaveBeenCalledWith(
      { _id: 'room123' },
      { _id: 'user123' }
    );
  });

  // LAST MESSAGE HANDLING
  test('TC-STAR-009: should update last message star if is last message', async () => {
    isTheLastMessage.mockReturnValue(true);

    await starMessage(mockUserId, mockMessage);

    expect(Rooms.updateLastMessageStar).toHaveBeenCalledWith(
      'room123',
      'user123',
      true
    );
  });

  test('TC-STAR-010: should not update last message if not last', async () => {
    isTheLastMessage.mockReturnValue(false);

    await starMessage(mockUserId, mockMessage);

    expect(Rooms.updateLastMessageStar).not.toHaveBeenCalled();
  });

  // STAR/UNSTAR TESTS
  test('TC-STAR-011: should star message successfully', async () => {
    const result = await starMessage(mockUserId, mockMessage);

    expect(result).toBe(true);
    expect(Messages.updateUserStarById).toHaveBeenCalledWith(
      'msg123',
      'user123',
      true
    );
  });

  test('TC-STAR-012: should unstar message successfully', async () => {
    const unstarMessage = { ...mockMessage, starred: false };
    
    const result = await starMessage(mockUserId, unstarMessage);

    expect(result).toBe(true);
    expect(Messages.updateUserStarById).toHaveBeenCalledWith(
      'msg123',
      'user123',
      false
    );
  });

  // DATABASE UPDATE TESTS
  test('TC-STAR-013: should update user star in database', async () => {
    await starMessage(mockUserId, mockMessage);

    expect(Messages.updateUserStarById).toHaveBeenCalled();
  });

  test('TC-STAR-014: should call updateUserStarById once', async () => {
    await starMessage(mockUserId, mockMessage);

    expect(Messages.updateUserStarById).toHaveBeenCalledTimes(1);
  });

  // RETURN VALUE TESTS
  test('TC-STAR-015: should return true on successful star', async () => {
    const result = await starMessage(mockUserId, mockMessage);

    expect(result).toBe(true);
  });

  test('TC-STAR-016: should return false on missing subscription', async () => {
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue(null);

    const result = await starMessage(mockUserId, mockMessage);

    expect(result).toBe(false);
  });

  test('TC-STAR-017: should return false on missing message', async () => {
    Messages.findOneByRoomIdAndMessageId.mockResolvedValue(null);

    const result = await starMessage(mockUserId, mockMessage);

    expect(result).toBe(false);
  });

  // EDGE CASES
  test('TC-STAR-018: should handle starred=true', async () => {
    const starredMsg = { _id: 'msg123', rid: 'room123', starred: true };
    
    await starMessage(mockUserId, starredMsg);

    expect(Messages.updateUserStarById).toHaveBeenCalledWith(
      'msg123',
      'user123',
      true
    );
  });

  test('TC-STAR-019: should handle starred=false', async () => {
    const unstarredMsg = { _id: 'msg123', rid: 'room123', starred: false };
    
    await starMessage(mockUserId, unstarredMsg);

    expect(Messages.updateUserStarById).toHaveBeenCalledWith(
      'msg123',
      'user123',
      false
    );
  });

  test('TC-STAR-020: should handle multiple star operations', async () => {
    await starMessage(mockUserId, mockMessage);
    await starMessage(mockUserId, { ...mockMessage, starred: false });

    expect(Messages.updateUserStarById).toHaveBeenCalledTimes(2);
  });
});
