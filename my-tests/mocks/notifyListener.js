/**
 * Mock for notifyListener
 */
module.exports = {
  notifyOnSubscriptionChangedByRoomIdAndUserId: jest.fn().mockResolvedValue(true),
  notifyOnRoomChangedById: jest.fn().mockResolvedValue(true),
  notifyOnMessageChange: jest.fn().mockResolvedValue(true)
};
