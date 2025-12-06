const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Message } = require('../mocks/core-services');
const { Rooms } = require('../mocks/models');

async function saveRoomReadOnly(rid, readOnly, user, sendMessage = true) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }

  const result = await Rooms.setReadOnlyById(rid, readOnly);

  if (result && sendMessage) {
    if (readOnly) {
      await Message.saveSystemMessage('room-set-read-only', rid, '', user);
    } else {
      await Message.saveSystemMessage('room-removed-read-only', rid, '', user);
    }
  }
  return result;
}

describe('saveRoomReadOnly - White-Box Testing', () => {
  const mockUser = { _id: 'user123', username: 'testuser', name: 'Test User' };
  const validRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-WB-016: should throw error for invalid room ID', async () => {
    await expect(
      saveRoomReadOnly(null, true, mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-017: should set room to read-only', async () => {
    Rooms.setReadOnlyById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomReadOnly(validRoomId, true, mockUser);
    
    expect(Rooms.setReadOnlyById).toHaveBeenCalledWith(validRoomId, true);
  });

  test('TC-WB-018: should send "set-read-only" message when enabling', async () => {
    Rooms.setReadOnlyById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomReadOnly(validRoomId, true, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room-set-read-only',
      validRoomId,
      '',
      mockUser
    );
  });

  test('TC-WB-019: should send "removed-read-only" message when disabling', async () => {
    Rooms.setReadOnlyById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomReadOnly(validRoomId, false, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room-removed-read-only',
      validRoomId,
      '',
      mockUser
    );
  });

  test('TC-WB-020: should not send message when sendMessage is false', async () => {
    Rooms.setReadOnlyById.mockResolvedValue({ modifiedCount: 1 });
    
    await saveRoomReadOnly(validRoomId, true, mockUser, false);
    
    expect(Message.saveSystemMessage).not.toHaveBeenCalled();
  });

  test('TC-WB-021: should execute if-branch for readOnly=true', async () => {
    Rooms.setReadOnlyById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomReadOnly(validRoomId, true, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room-set-read-only',
      expect.any(String),
      expect.any(String),
      expect.any(Object)
    );
  });

  test('TC-WB-022: should execute else-branch for readOnly=false', async () => {
    Rooms.setReadOnlyById.mockResolvedValue({ modifiedCount: 1 });
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomReadOnly(validRoomId, false, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room-removed-read-only',
      expect.any(String),
      expect.any(String),
      expect.any(Object)
    );
  });

  test('TC-WB-023: should return database result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.setReadOnlyById.mockResolvedValue(mockResult);
    
    const result = await saveRoomReadOnly(validRoomId, true, mockUser, false);
    
    expect(result).toEqual(mockResult);
  });
});
