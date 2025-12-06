module.exports = {
  Match: {
    test: jest.fn((value, pattern) => {
      if (pattern === String) return typeof value === 'string' && value !== '';
      if (pattern === Object) return typeof value === 'object' && value !== null;
      return true;
    })
  }
};
