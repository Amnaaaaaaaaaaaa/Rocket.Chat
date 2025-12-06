const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Message } = require('../mocks/core-services');
const { Rooms } = require('../mocks/models');

async function saveRoomAnnouncement(rid, roomAnnouncement, user, sendMessage = true) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }

  let message;
  let announcementDetails;
  
  if (typeof roomAnnouncement === 'string') {
    message = roomAnnouncement;
  } else {
    ({ message, ...announcementDetails } = roomAnnouncement);
  }

  const updated = await Rooms.setAnnouncementById(rid, message, announcementDetails);
  
  if (updated && sendMessage) {
    await Message.saveSystemMessage('room_changed_announcement', rid, message, user);
  }

  return updated;
}

describe('saveRoomAnnouncement - White-Box Testing', () => {
  
  const mockUser = { _id: 'user123', username: 'testuser' };
  const validRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-WB-001: should throw error for null room ID', async () => {
    await expect(
      saveRoomAnnouncement(null, 'test', mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-002: should throw error for empty room ID', async () => {
    await expect(
      saveRoomAnnouncement('', 'test', mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-003: should handle string announcement', async () => {
    Rooms.setAnnouncementById.mockResolvedValue({ modifiedCount: 1 });
    await saveRoomAnnouncement(validRoomId, 'Test', mockUser, false);
    expect(Rooms.setAnnouncementById).toHaveBeenCalledWith(validRoomId, 'Test', undefined);
  });

  test('TC-WB-004: should handle object announcement', async () => {
    const announcement = { message: 'Text', color: 'red' };
    Rooms.setAnnouncementById.mockResolvedValue({ modifiedCount: 1 });
    await saveRoomAnnouncement(validRoomId, announcement, mockUser, false);
    expect(Rooms.setAnnouncementById).toHaveBeenCalledWith(validRoomId, 'Text', { color: 'red' });
  });

  test('TC-WB-005: should send system message when enabled', async () => {
    Rooms.setAnnouncementById.mockResolvedValue({ modifiedCount: 1 });
    await saveRoomAnnouncement(validRoomId, 'Test', mockUser, true);
    expect(Message.saveSystemMessage).toHaveBeenCalled();
  });

  test('TC-WB-006: should not send message when disabled', async () => {
    Rooms.setAnnouncementById.mockResolvedValue({ modifiedCount: 1 });
    await saveRoomAnnouncement(validRoomId, 'Test', mockUser, false);
    expect(Message.saveSystemMessage).not.toHaveBeenCalled();
  });

  test('TC-WB-007: should return update result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.setAnnouncementById.mockResolvedValue(mockResult);
    const result = await saveRoomAnnouncement(validRoomId, 'Test', mockUser, false);
    expect(result).toEqual(mockResult);
  });
});
