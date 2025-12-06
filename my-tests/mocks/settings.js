const settings = {
  get: jest.fn((key) => {
    if (key === 'Message_AllowPinning') return true;
    if (key === 'Message_AllowStarring') return true;
    return true;
  })
};

module.exports = { settings };
