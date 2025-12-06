const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Message } = require('../mocks/core-services');
const { Rooms, Subscriptions } = require('../mocks/models');

const isRegisterUser = (user) => {
  return user && user._id && user.username;
};

async function saveRoomEncrypted(rid, encrypted, user, sendMessage = true) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }

  if (!isRegisterUser(user)) {
    throw new Meteor.Error('invalid-user', 'Invalid user');
  }

  const update = await Rooms.saveEncryptedById(rid, encrypted);
  if (update && sendMessage) {
    const type = encrypted ? 'room_e2e_enabled' : 'room_e2e_disabled';
    await Message.saveSystemMessage(type, rid, user.username, user);
  }

  if (encrypted) {
    await Subscriptions.disableAutoTranslateByRoomId(rid);
  }
  return update;
}

describe('saveRoomEncrypted - White-Box Testing', () => {
  const mockUser = { _id: 'user123', username: 'testuser' };
  const validRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
    Rooms.saveEncryptedById = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    Subscriptions.disableAutoTranslateByRoomId.mockResolvedValue({ modifiedCount: 1 });
  });

  test('TC-WB-042: should throw error for invalid room ID', async () => {
    await expect(
      saveRoomEncrypted(null, true, mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-043: should throw error for invalid user', async () => {
    await expect(
      saveRoomEncrypted(validRoomId, true, null)
    ).rejects.toThrow('Invalid user');
  });

  test('TC-WB-044: should throw error for user without _id', async () => {
    await expect(
      saveRoomEncrypted(validRoomId, true, { username: 'test' })
    ).rejects.toThrow('Invalid user');
  });

  test('TC-WB-045: should enable encryption', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomEncrypted(validRoomId, true, mockUser, false);
    
    expect(Rooms.saveEncryptedById).toHaveBeenCalledWith(validRoomId, true);
  });

  test('TC-WB-046: should send "e2e_enabled" message when enabling', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomEncrypted(validRoomId, true, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_e2e_enabled',
      validRoomId,
      'testuser',
      mockUser
    );
  });

  test('TC-WB-047: should send "e2e_disabled" message when disabling', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomEncrypted(validRoomId, false, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_e2e_disabled',
      validRoomId,
      'testuser',
      mockUser
    );
  });

  test('TC-WB-048: should disable auto-translate when enabling encryption', async () => {
    await saveRoomEncrypted(validRoomId, true, mockUser, false);
    
    expect(Subscriptions.disableAutoTranslateByRoomId).toHaveBeenCalledWith(validRoomId);
  });

  test('TC-WB-049: should not disable auto-translate when disabling encryption', async () => {
    await saveRoomEncrypted(validRoomId, false, mockUser, false);
    
    expect(Subscriptions.disableAutoTranslateByRoomId).not.toHaveBeenCalled();
  });

  test('TC-WB-050: should execute if-branch for encrypted=true', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveRoomEncrypted(validRoomId, true, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room_e2e_enabled',
      expect.any(String),
      expect.any(String),
      expect.any(Object)
    );
  });

  test('TC-WB-051: should return update result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.saveEncryptedById.mockResolvedValue(mockResult);
    
    const result = await saveRoomEncrypted(validRoomId, true, mockUser, false);
    
    expect(result).toEqual(mockResult);
  });
});
