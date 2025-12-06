const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Message } = require('../mocks/core-services');
const { Rooms } = require('../mocks/models');

async function saveReactWhenReadOnly(rid, allowReact, user, sendMessage = true) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }

  const result = await Rooms.setAllowReactingWhenReadOnlyById(rid, allowReact);

  if (result && sendMessage) {
    const type = allowReact ? 'room-allowed-reacting' : 'room-disallowed-reacting';
    await Message.saveSystemMessage(type, rid, '', user);
  }
  
  return result;
}

describe('saveReactWhenReadOnly - White-Box Testing', () => {
  const mockUser = { _id: 'user123', username: 'testuser' };
  const validRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
    Rooms.setAllowReactingWhenReadOnlyById = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  });

  test('TC-WB-068: should throw error for invalid room ID', async () => {
    await expect(
      saveReactWhenReadOnly(null, true, mockUser)
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-069: should allow reacting when true', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveReactWhenReadOnly(validRoomId, true, mockUser, false);
    
    expect(Rooms.setAllowReactingWhenReadOnlyById).toHaveBeenCalledWith(validRoomId, true);
  });

  test('TC-WB-070: should disallow reacting when false', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveReactWhenReadOnly(validRoomId, false, mockUser, false);
    
    expect(Rooms.setAllowReactingWhenReadOnlyById).toHaveBeenCalledWith(validRoomId, false);
  });

  test('TC-WB-071: should send "allowed-reacting" message when enabling', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveReactWhenReadOnly(validRoomId, true, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room-allowed-reacting',
      validRoomId,
      '',
      mockUser
    );
  });

  test('TC-WB-072: should send "disallowed-reacting" message when disabling', async () => {
    Message.saveSystemMessage.mockResolvedValue(true);
    
    await saveReactWhenReadOnly(validRoomId, false, mockUser, true);
    
    expect(Message.saveSystemMessage).toHaveBeenCalledWith(
      'room-disallowed-reacting',
      validRoomId,
      '',
      mockUser
    );
  });

  test('TC-WB-073: should not send message when disabled', async () => {
    await saveReactWhenReadOnly(validRoomId, true, mockUser, false);
    
    expect(Message.saveSystemMessage).not.toHaveBeenCalled();
  });

  test('TC-WB-074: should return database result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.setAllowReactingWhenReadOnlyById.mockResolvedValue(mockResult);
    
    const result = await saveReactWhenReadOnly(validRoomId, true, mockUser, false);
    
    expect(result).toEqual(mockResult);
  });
});
