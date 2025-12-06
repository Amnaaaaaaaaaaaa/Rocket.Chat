/**
 * Mock for @rocket.chat/core-services
 */

const mockMessage = {
  saveSystemMessage: jest.fn().mockResolvedValue({
    _id: 'msg_123',
    ts: new Date(),
    msg: 'System message',
    t: 'room_changed_description',
    u: { _id: 'user_123', username: 'system' }
  }),
  beforeSave: jest.fn(({ message }) => Promise.resolve(message))
};

const mockRoom = {
  beforeNameChange: jest.fn().mockResolvedValue(true),
  beforeTopicChange: jest.fn().mockResolvedValue(true)
};

module.exports = {
  Message: mockMessage,
  Room: mockRoom
};
