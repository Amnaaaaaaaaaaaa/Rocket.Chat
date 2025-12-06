const Rooms = {
  findOneById: jest.fn(),
  setAnnouncementById: jest.fn(),
  setDescriptionById: jest.fn(),
  setReadOnlyById: jest.fn(),
  setTopicById: jest.fn(),
  setTypeById: jest.fn(),
  saveEncryptedById: jest.fn(),
  setCustomFieldsById: jest.fn()
};

const Subscriptions = {
  setAsUnreadByRoomIdAndUserId: jest.fn(),
  updateTypeByRoomId: jest.fn(),
  disableAutoTranslateByRoomId: jest.fn(),
  updateCustomFieldsByRoomId: jest.fn(),
  findOneByRoomIdAndUserId: jest.fn()
};

const Messages = {
  findVisibleByRoomId: jest.fn(),
  findOneById: jest.fn()
};

const Message = {
  saveSystemMessage: jest.fn()
};

const Users = {
  findByIds: jest.fn()
};

module.exports = { Rooms, Subscriptions, Messages, Message, Users };
