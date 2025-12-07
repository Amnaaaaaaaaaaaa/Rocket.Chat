const Messages = {
  findOneById: jest.fn(),
  findOneByRoomIdAndMessageId: jest.fn(),
  update: jest.fn(),
  updateUserStarById: jest.fn()
};

const Subscriptions = {
  findOneByRoomIdAndUserId: jest.fn(),
  update: jest.fn()
};

const Rooms = {
  findOneById: jest.fn(),
  update: jest.fn()
};

const Users = {
  findOneById: jest.fn(),
  findByIds: jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue([])
  })
};

module.exports = { Messages, Subscriptions, Rooms, Users };
