const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Message, Room } = require('../mocks/core-services');
const { Rooms } = require('../mocks/models');

async function saveRoomTopic(rid, roomTopic, user, sendMessage = true) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }

  const room = await Rooms.findOneById(rid);
  await Room.beforeTopicChange(room);

  const update = await Rooms.setTopicById(rid, roomTopic);
  if (update && sendMessage) {
    await Message.saveSystemMessage('room_changed_topic', rid, roomTopic || '', user);
  }
  return update;
}

describe('saveRoomTopic - White-Box Testing', () => {
  const mockUser = { _id: 'user123', username: 'testuser' };
  const validRoomId = 'room123';
  const mockRoom = { _id: 'room123', name: 'test-room' };

  beforeEach(() => {
    jest.clearAllMocks();
    Rooms.findOneById.mockResolvedValue(mockRoom);
    Room.beforeTopicChange.mockResolvedValue(true);
  });

  test('TC-WB-024: should throw error for invalid room ID', async () => {
    await expect(
      saveRoomTopic(null, 'Topic', mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-025: should find room before updating', async () => {
    Rooms.setTopicById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomTopic(validRoomId, 'New topic', mockUser, false);
    
    expect(Rooms.findOneById).toHaveBeenCalledWith(validRoomId);
  });

  test('TC-WB-026: should call beforeTopicChange hook', async () => {
    Rooms.setTopicById.mockResolvedValue({ modifiedCount: 1 });
    
    await saveRoomTopic(validRoomId, 'Topic', mockUser, false);
    
    expect(Room.beforeTopicChange).toHaveBeenCalledWith(mockRoom);
  });

  test('TC-WB-027: should update topic in database', async () => {
    Rooms.setTopicById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomTopic(validRoomId, 'New topic', mockUser, false);
    
    expect(Rooms.setTopicById).toHaveBeenCalledWith(validRoomId, 'New topic');
  });

  test('TC-WB-028: should send system message when enabled', async () => {
    Rooms.setTopicById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomTopic(validRoomId, 'Topic', mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_changed_topic',
      validRoomId,
      'Topic',
      mockUser
    );
  });

  test('TC-WB-029: should handle undefined topic with empty string', async () => {
    Rooms.setTopicById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomTopic(validRoomId, undefined, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_changed_topic',
      validRoomId,
      '',
      mockUser
    );
  });

  test('TC-WB-030: should not send message when disabled', async () => {
    Rooms.setTopicById.mockResolvedValue({ modifiedCount: 1 });
    
    await saveRoomTopic(validRoomId, 'Topic', mockUser, false);
    
    expect(Message.saveSystemMessage).not.toHaveBeenCalled();
  });

  test('TC-WB-031: should return update result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.setTopicById.mockResolvedValue(mockResult);
    
    const result = await saveRoomTopic(validRoomId, 'Topic', mockUser, false);
    
    expect(result).toEqual(mockResult);
  });
});
