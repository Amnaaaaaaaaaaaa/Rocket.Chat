/**
 * Mock for utility functions
 */
module.exports = {
  getUserAvatarURL: jest.fn((username) => `https://avatar.url/${username}`),
  isTheLastMessage: jest.fn(() => false),
  isTruthy: jest.fn((val) => !!val)
};
