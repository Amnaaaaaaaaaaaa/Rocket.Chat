const Match = {
  test: jest.fn().mockReturnValue(true),
  OneOf: jest.fn(),
  Optional: jest.fn()
};

module.exports = { Match };
