/**
 * Mock for Apps
 */
module.exports = {
  Apps: {
    self: {
      triggerEvent: jest.fn().mockResolvedValue(true)
    }
  },
  AppEvents: {
    IPostMessagePinned: 'IPostMessagePinned'
  }
};
