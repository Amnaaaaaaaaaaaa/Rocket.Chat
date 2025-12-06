const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Message } = require('../mocks/core-services');
const { Rooms } = require('../mocks/models');

async function saveRoomDescription(rid, roomDescription, user) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }

  const update = await Rooms.setDescriptionById(rid, roomDescription);
  await Message.saveSystemMessage('room_changed_description', rid, roomDescription, user);
  return update;
}

describe('saveRoomDescription - White-Box Testing', () => {
  const mockUser = { _id: 'user123', username: 'testuser' };
  const validRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-WB-008: should throw error for null room ID', async () => {
    await expect(
      saveRoomDescription(null, 'Description', mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-009: should throw error for empty room ID', async () => {
    await expect(
      saveRoomDescription('', 'Description', mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-010: should throw error for numeric room ID', async () => {
    await expect(
      saveRoomDescription(123, 'Description', mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-011: should update description in database', async () => {
    Rooms.setDescriptionById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomDescription(validRoomId, 'New description', mockUser);
    
    expect(Rooms.setDescriptionById).toHaveBeenCalledWith(validRoomId, 'New description');
  });

  test('TC-WB-012: should always send system message', async () => {
    Rooms.setDescriptionById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomDescription(validRoomId, 'Test', mockUser);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_changed_description',
      validRoomId,
      'Test',
      mockUser
    );
  });

  test('TC-WB-013: should handle empty description', async () => {
    Rooms.setDescriptionById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomDescription(validRoomId, '', mockUser);
    
    expect(Rooms.setDescriptionById).toHaveBeenCalledWith(validRoomId, '');
  });

  test('TC-WB-014: should handle HTML in description', async () => {
    const html = '<h1>Title</h1><p>Content</p>';
    Rooms.setDescriptionById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomDescription(validRoomId, html, mockUser);
    
    expect(Rooms.setDescriptionById).toHaveBeenCalledWith(validRoomId, html);
  });

  test('TC-WB-015: should return update result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.setDescriptionById.mockResolvedValue(mockResult);
    Message.saveSystemMessage.mockResolvedValue(true);
    
    const result = await saveRoomDescription(validRoomId, 'Test', mockUser);
    
    expect(result).toEqual(mockResult);
  });
});
