const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Message } = require('../mocks/core-services');
const { Rooms, Subscriptions } = require('../mocks/models');

async function saveRoomType(rid, roomType, user, sendMessage = true) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }
  if (roomType !== 'c' && roomType !== 'p') {
    throw new Meteor.Error('error-invalid-room-type', 'error-invalid-room-type');
  }
  
  const room = await Rooms.findOneById(rid);
  if (room == null) {
    throw new Meteor.Error('error-invalid-room', 'error-invalid-room');
  }

  const result = await Promise.all([
    Rooms.setTypeById(rid, roomType),
    Subscriptions.updateTypeByRoomId(rid, roomType)
  ]);

  if (sendMessage) {
    let message = roomType === 'c' ? 'public' : 'private';
    await Message.saveSystemMessage('room_changed_privacy', rid, message, user);
  }

  return result;
}

describe('saveRoomType - White-Box Testing', () => {
  const mockUser = { _id: 'user123', username: 'testuser', language: 'en' };
  const validRoomId = 'room123';
  const mockRoom = { _id: 'room123', t: 'c' };

  beforeEach(() => {
    jest.clearAllMocks();
    Rooms.findOneById.mockResolvedValue(mockRoom);
    Rooms.setTypeById.mockResolvedValue({ modifiedCount: 1 });
    Subscriptions.updateTypeByRoomId.mockResolvedValue({ modifiedCount: 1 });
  });

  test('TC-WB-032: should throw error for invalid room ID', async () => {
    await expect(
      saveRoomType(null, 'c', mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-033: should throw error for invalid room type', async () => {
    await expect(
      saveRoomType(validRoomId, 'x', mockUser)
    ).rejects.toThrow('error-invalid-room-type');
  });

  test('TC-WB-034: should throw error if room not found', async () => {
    Rooms.findOneById.mockResolvedValue(null);
    
    await expect(
      saveRoomType(validRoomId, 'c', mockUser)
    ).rejects.toThrow('error-invalid-room');
  });

  test('TC-WB-035: should accept type "c" (channel)', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomType(validRoomId, 'c', mockUser, false);
    
    expect(Rooms.setTypeById).toHaveBeenCalledWith(validRoomId, 'c');
  });

  test('TC-WB-036: should accept type "p" (private)', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomType(validRoomId, 'p', mockUser, false);
    
    expect(Rooms.setTypeById).toHaveBeenCalledWith(validRoomId, 'p');
  });

  test('TC-WB-037: should update both Rooms and Subscriptions', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomType(validRoomId, 'c', mockUser, false);
    
    expect(Rooms.setTypeById).toHaveBeenCalled();
    expect(Subscriptions.updateTypeByRoomId).toHaveBeenCalled();
  });

  test('TC-WB-038: should send "public" message for type c', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomType(validRoomId, 'c', mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_changed_privacy',
      validRoomId,
      'public',
      mockUser
    );
  });

  test('TC-WB-039: should send "private" message for type p', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomType(validRoomId, 'p', mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_changed_privacy',
      validRoomId,
      'private',
      mockUser
    );
  });

  test('TC-WB-040: should not send message when disabled', async () => {
    await saveRoomType(validRoomId, 'c', mockUser, false);
    
    expect(Message.saveSystemMessage).not.toHaveBeenCalled();
  });

  test('TC-WB-041: should return array of results', async () => {
    const result = await saveRoomType(validRoomId, 'c', mockUser, false);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });
});
