const { Meteor } = require('../mocks/meteor-meteor');
const { Messages, Subscriptions } = require('../mocks/models');
const { notifyOnSubscriptionChangedByRoomIdAndUserId } = require('../mocks/notifyListener');

// Mock logger
const mockLogger = {
  debug: jest.fn()
};

// Function under test
async function unreadMessages(userId, firstUnreadMessage, room) {
  // Path 1: Room-based unread
  if (room && typeof room === 'string') {
    const lastMessage = (
      await Messages.findVisibleByRoomId(room, {
        limit: 1,
        sort: { ts: -1 }
      }).toArray()
    )[0];

    if (!lastMessage) {
      throw new Meteor.Error('error-no-message-for-unread', 'There are no messages to mark unread', {
        method: 'unreadMessages',
        action: 'Unread_messages'
      });
    }

    const setAsUnreadResponse = await Subscriptions.setAsUnreadByRoomIdAndUserId(
      lastMessage.rid, 
      userId, 
      lastMessage.ts
    );
    
    if (setAsUnreadResponse.modifiedCount) {
      void notifyOnSubscriptionChangedByRoomIdAndUserId(lastMessage.rid, userId);
    }

    return;
  }

  // Path 2: Message-based unread
  if (typeof firstUnreadMessage?._id !== 'string') {
    throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
      method: 'unreadMessages',
      action: 'Unread_messages'
    });
  }

  const originalMessage = await Messages.findOneById(firstUnreadMessage._id, {
    projection: { u: 1, rid: 1, ts: 1 }
  });

  if (!originalMessage || userId === originalMessage.u._id) {
    throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
      method: 'unreadMessages',
      action: 'Unread_messages'
    });
  }

  const lastSeen = (await Subscriptions.findOneByRoomIdAndUserId(originalMessage.rid, userId))?.ls;
  
  if (!lastSeen) {
    throw new Meteor.Error('error-subscription-not-found', 'Subscription not found', {
      method: 'unreadMessages',
      action: 'Unread_messages'
    });
  }

  if (originalMessage.ts >= lastSeen) {
    return mockLogger.debug('Provided message is already marked as unread');
  }

  mockLogger.debug(`Updating unread message of ${originalMessage.ts} as the first unread`);
  
  const setAsUnreadResponse = await Subscriptions.setAsUnreadByRoomIdAndUserId(
    originalMessage.rid, 
    userId, 
    originalMessage.ts
  );
  
  if (setAsUnreadResponse.modifiedCount) {
    void notifyOnSubscriptionChangedByRoomIdAndUserId(originalMessage.rid, userId);
  }
}

describe('unreadMessages - White-Box Testing', () => {
  const mockUserId = 'user123';
  const mockRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ROOM-BASED PATH TESTS
  test('TC-MSG-001: should throw error if room has no messages', async () => {
    Messages.findVisibleByRoomId.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });

    await expect(
      unreadMessages(mockUserId, undefined, mockRoomId)
    ).rejects.toThrow('There are no messages to mark unread');
  });

  test('TC-MSG-002: should mark room as unread using last message', async () => {
    const lastMessage = {
      _id: 'msg123',
      rid: 'room123',
      ts: new Date('2025-01-01T12:00:00Z'),
      u: { _id: 'user456' }
    };

    Messages.findVisibleByRoomId.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([lastMessage])
    });
    Subscriptions.setAsUnreadByRoomIdAndUserId.mockResolvedValue({ modifiedCount: 1 });

    await unreadMessages(mockUserId, undefined, mockRoomId);

    expect(Subscriptions.setAsUnreadByRoomIdAndUserId).toHaveBeenCalledWith(
      'room123',
      mockUserId,
      lastMessage.ts
    );
  });

  test('TC-MSG-003: should notify when room marked unread', async () => {
    const lastMessage = { _id: 'msg123', rid: 'room123', ts: new Date(), u: { _id: 'user456' } };
    Messages.findVisibleByRoomId.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([lastMessage])
    });
    Subscriptions.setAsUnreadByRoomIdAndUserId.mockResolvedValue({ modifiedCount: 1 });

    await unreadMessages(mockUserId, undefined, mockRoomId);

    expect(notifyOnSubscriptionChangedByRoomIdAndUserId).toHaveBeenCalled();
  });

  test('TC-MSG-004: should not notify if not modified', async () => {
    const lastMessage = { _id: 'msg123', rid: 'room123', ts: new Date(), u: { _id: 'user456' } };
    Messages.findVisibleByRoomId.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([lastMessage])
    });
    Subscriptions.setAsUnreadByRoomIdAndUserId.mockResolvedValue({ modifiedCount: 0 });

    await unreadMessages(mockUserId, undefined, mockRoomId);

    expect(notifyOnSubscriptionChangedByRoomIdAndUserId).not.toHaveBeenCalled();
  });

  test('TC-MSG-005: should handle room with limit and sort', async () => {
    const lastMessage = { _id: 'msg123', rid: 'room123', ts: new Date(), u: { _id: 'user456' } };
    Messages.findVisibleByRoomId.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([lastMessage])
    });
    Subscriptions.setAsUnreadByRoomIdAndUserId.mockResolvedValue({ modifiedCount: 1 });

    await unreadMessages(mockUserId, undefined, mockRoomId);

    expect(Messages.findVisibleByRoomId).toHaveBeenCalledWith(mockRoomId, {
      limit: 1,
      sort: { ts: -1 }
    });
  });

  // MESSAGE-BASED PATH TESTS
  test('TC-MSG-006: should throw error if message ID not string', async () => {
    await expect(
      unreadMessages(mockUserId, { _id: 123 }, undefined)
    ).rejects.toThrow('Not allowed');
  });

  test('TC-MSG-007: should throw error if message undefined', async () => {
    await expect(
      unreadMessages(mockUserId, undefined, undefined)
    ).rejects.toThrow('Not allowed');
  });

  test('TC-MSG-008: should throw error if message not found', async () => {
    Messages.findOneById.mockResolvedValue(null);

    await expect(
      unreadMessages(mockUserId, { _id: 'msg123' }, undefined)
    ).rejects.toThrow('Not allowed');
  });

  test('TC-MSG-009: should throw error if user is author', async () => {
    Messages.findOneById.mockResolvedValue({
      _id: 'msg123',
      rid: 'room123',
      ts: new Date(),
      u: { _id: 'user123' }
    });

    await expect(
      unreadMessages(mockUserId, { _id: 'msg123' }, undefined)
    ).rejects.toThrow('Not allowed');
  });

  test('TC-MSG-010: should throw error if subscription not found', async () => {
    Messages.findOneById.mockResolvedValue({
      _id: 'msg123',
      rid: 'room123',
      ts: new Date(),
      u: { _id: 'user456' }
    });
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue(null);

    await expect(
      unreadMessages(mockUserId, { _id: 'msg123' }, undefined)
    ).rejects.toThrow('Subscription not found');
  });

  test('TC-MSG-011: should throw error if no lastSeen', async () => {
    Messages.findOneById.mockResolvedValue({
      _id: 'msg123',
      rid: 'room123',
      ts: new Date(),
      u: { _id: 'user456' }
    });
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue({ _id: 'sub123', ls: undefined });

    await expect(
      unreadMessages(mockUserId, { _id: 'msg123' }, undefined)
    ).rejects.toThrow('Subscription not found');
  });

  test('TC-MSG-012: should skip if already unread', async () => {
    Messages.findOneById.mockResolvedValue({
      _id: 'msg123',
      rid: 'room123',
      ts: new Date('2025-01-01T11:00:00Z'),
      u: { _id: 'user456' }
    });
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue({
      _id: 'sub123',
      ls: new Date('2025-01-01T10:00:00Z')
    });

    await unreadMessages(mockUserId, { _id: 'msg123' }, undefined);

    expect(Subscriptions.setAsUnreadByRoomIdAndUserId).not.toHaveBeenCalled();
  });

  test('TC-MSG-013: should mark message as unread', async () => {
    const messageTs = new Date('2025-01-01T09:00:00Z');
    Messages.findOneById.mockResolvedValue({
      _id: 'msg123',
      rid: 'room123',
      ts: messageTs,
      u: { _id: 'user456' }
    });
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue({
      _id: 'sub123',
      ls: new Date('2025-01-01T10:00:00Z')
    });
    Subscriptions.setAsUnreadByRoomIdAndUserId.mockResolvedValue({ modifiedCount: 1 });

    await unreadMessages(mockUserId, { _id: 'msg123' }, undefined);

    expect(Subscriptions.setAsUnreadByRoomIdAndUserId).toHaveBeenCalledWith('room123', mockUserId, messageTs);
  });

  test('TC-MSG-014: should notify when marked unread', async () => {
    Messages.findOneById.mockResolvedValue({
      _id: 'msg123',
      rid: 'room123',
      ts: new Date('2025-01-01T09:00:00Z'),
      u: { _id: 'user456' }
    });
    Subscriptions.findOneByRoomIdAndUserId.mockResolvedValue({
      _id: 'sub123',
      ls: new Date('2025-01-01T10:00:00Z')
    });
    Subscriptions.setAsUnreadByRoomIdAndUserId.mockResolvedValue({ modifiedCount: 1 });

    await unreadMessages(mockUserId, { _id: 'msg123' }, undefined);

    expect(notifyOnSubscriptionChangedByRoomIdAndUserId).toHaveBeenCalled();
  });

  test('TC-MSG-015: should prioritize room over message', async () => {
    const lastMessage = { _id: 'msg123', rid: 'room123', ts: new Date(), u: { _id: 'user456' } };
    Messages.findVisibleByRoomId.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([lastMessage])
    });
    Subscriptions.setAsUnreadByRoomIdAndUserId.mockResolvedValue({ modifiedCount: 1 });

    await unreadMessages(mockUserId, { _id: 'msg999' }, mockRoomId);

    expect(Messages.findVisibleByRoomId).toHaveBeenCalled();
    expect(Messages.findOneById).not.toHaveBeenCalled();
  });
});
