const Message = {
  saveSystemMessage: jest.fn()
};

const Room = {
  beforeTopicChange: jest.fn()
};

module.exports = { Message, Room };
