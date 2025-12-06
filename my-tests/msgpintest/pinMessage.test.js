const { pinMessage, unpinMessage } = require('../src/message-pin/pinMessage');
const { Messages, Rooms, Users } = require('../mocks/models');
const { settings } = require('../mocks/settings');
const { hasPermissionAsync, canAccessRoomAsync } = require('../mocks/authorization');
const { Message } = require('../mocks/core-services');

describe('pinMessage - White-Box Testing', () => {
  const mockUserId = 'user123';
  const mockMessage = { _id: 'msg123', rid: 'room123' };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock behaviors
    settings.get.mockImplementation((key) => {
      if (key === 'Message_AllowPinning') return true;
      if (key === 'Message_Read_Receipt_Store_Users') return false;
      if (key === 'Message_QuoteChainLimit') return 5;
      return null;
    });
    
    hasPermissionAsync.mockResolvedValue(true);
    canAccessRoomAsync.mockResolvedValue(true);
    Message.beforeSave.mockImplementation(({message}) => message);
    Message.saveSystemMessage.mockResolvedValue({ _id: 'sys_msg' });
  });

  // PIN MESSAGE TESTS
  test('TC-PIN-001: should throw error if message not found', async () => {
    Messages.findOneById.mockResolvedValue(null);

    await expect(
      pinMessage(mockMessage, mockUserId)
    ).rejects.toThrow('Message you are pinning was not found');
  });

  test('TC-PIN-002: should throw error if message has no rid', async () => {
    Messages.findOneById.mockResolvedValue({ _id: 'msg123', rid: null });

    await expect(
      pinMessage(mockMessage, mockUserId)
    ).rejects.toThrow('Message you are pinning was not found');
  });

  test('TC-PIN-003: should throw error if pinning not allowed', async () => {
    settings.get.mockReturnValue(false);
    Messages.findOneById.mockResolvedValue({ ...mockMessage, rid: 'room123' });

    await expect(
      pinMessage(mockMessage, mockUserId)
    ).rejects.toThrow('Message pinning not allowed');
  });

  test('TC-PIN-004: should throw error if user has no permission', async () => {
    Messages.findOneById.mockResolvedValue({ ...mockMessage, rid: 'room123' });
    hasPermissionAsync.mockResolvedValue(false);

    await expect(
      pinMessage(mockMessage, mockUserId)
    ).rejects.toThrow('Not Authorized');
  });

  test('TC-PIN-005: should throw error if room not found', async () => {
    Messages.findOneById.mockResolvedValue({ ...mockMessage, rid: 'room123' });
    Rooms.findOneById.mockResolvedValue(null);

    await expect(
      pinMessage(mockMessage, mockUserId)
    ).rejects.toThrow('Not Authorized');
  });

  test('TC-PIN-006: should throw error if user cannot access room', async () => {
    Messages.findOneById.mockResolvedValue({ ...mockMessage, rid: 'room123' });
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    canAccessRoomAsync.mockResolvedValue(false);

    await expect(
      pinMessage(mockMessage, mockUserId)
    ).rejects.toThrow('Not Authorized');
  });

  test('TC-PIN-007: should return message if already pinned', async () => {
    const pinnedMessage = { 
      ...mockMessage, 
      rid: 'room123', 
      pinned: true,
      u: { username: 'sender' }
    };
    Messages.findOneById.mockResolvedValue(pinnedMessage);
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    hasPermissionAsync.mockResolvedValue(true);
    canAccessRoomAsync.mockResolvedValue(true);

    const result = await pinMessage(mockMessage, mockUserId);

    expect(result.pinned).toBe(true);
  });

  test('TC-PIN-008: should throw error if user not found', async () => {
    Messages.findOneById.mockResolvedValue({ 
      ...mockMessage, 
      rid: 'room123', 
      pinned: false,
      u: { username: 'sender' }
    });
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    hasPermissionAsync.mockResolvedValue(true);
    canAccessRoomAsync.mockResolvedValue(true);
    Users.findOneById.mockResolvedValue(null);

    await expect(
      pinMessage(mockMessage, mockUserId)
    ).rejects.toThrow('Invalid user');
  });

  test('TC-PIN-009: should pin message successfully', async () => {
    Messages.findOneById.mockResolvedValue({ 
      ...mockMessage, 
      rid: 'room123', 
      pinned: false,
      u: { username: 'sender' },
      msg: 'Test message',
      ts: new Date()
    });
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    Users.findOneById.mockResolvedValue({ _id: 'user123', username: 'testuser' });
    hasPermissionAsync.mockResolvedValue(true);
    canAccessRoomAsync.mockResolvedValue(true);

    await pinMessage(mockMessage, mockUserId);

    expect(Messages.setPinnedByIdAndUserId).toHaveBeenCalled();
  });

  test('TC-PIN-010: should set pinnedAt to provided date', async () => {
    const customDate = new Date('2025-01-01');
    Messages.findOneById.mockResolvedValue({ 
      ...mockMessage, 
      rid: 'room123', 
      pinned: false,
      u: { username: 'sender' },
      msg: 'Test',
      ts: new Date()
    });
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    Users.findOneById.mockResolvedValue({ _id: 'user123', username: 'testuser' });
    hasPermissionAsync.mockResolvedValue(true);
    canAccessRoomAsync.mockResolvedValue(true);

    await pinMessage(mockMessage, mockUserId, customDate);

    expect(Messages.setPinnedByIdAndUserId).toHaveBeenCalled();
  });

  // UNPIN MESSAGE TESTS
  test('TC-PIN-011: should throw error if unpinning not allowed', async () => {
    settings.get.mockReturnValue(false);

    await expect(
      unpinMessage(mockUserId, mockMessage)
    ).rejects.toThrow('Message pinning not allowed');
  });

  test('TC-PIN-012: should throw error if message not found for unpin', async () => {
    Messages.findOneById.mockResolvedValue(null);

    await expect(
      unpinMessage(mockUserId, mockMessage)
    ).rejects.toThrow('Message you are unpinning was not found');
  });

  test('TC-PIN-013: should throw error if no permission to unpin', async () => {
    Messages.findOneById.mockResolvedValue({ ...mockMessage, rid: 'room123' });
    hasPermissionAsync.mockResolvedValue(false);

    await expect(
      unpinMessage(mockUserId, mockMessage)
    ).rejects.toThrow('Not Authorized');
  });

  test('TC-PIN-014: should unpin message successfully', async () => {
    Messages.findOneById.mockResolvedValue({ 
      ...mockMessage, 
      rid: 'room123',
      pinned: true,
      u: { username: 'sender' },
      ts: new Date()
    });
    Users.findOneById.mockResolvedValue({ _id: 'user123', username: 'testuser' });
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    hasPermissionAsync.mockResolvedValue(true);
    canAccessRoomAsync.mockResolvedValue(true);

    const result = await unpinMessage(mockUserId, mockMessage);

    expect(result).toBe(true);
    expect(Messages.setPinnedByIdAndUserId).toHaveBeenCalled();
  });

  test('TC-PIN-015: should return true on successful unpin', async () => {
    Messages.findOneById.mockResolvedValue({ 
      ...mockMessage, 
      rid: 'room123',
      u: { username: 'sender' },
      ts: new Date()
    });
    Users.findOneById.mockResolvedValue({ _id: 'user123', username: 'testuser' });
    Rooms.findOneById.mockResolvedValue({ _id: 'room123' });
    hasPermissionAsync.mockResolvedValue(true);
    canAccessRoomAsync.mockResolvedValue(true);

    const result = await unpinMessage(mockUserId, mockMessage);

    expect(result).toBe(true);
  });
});
