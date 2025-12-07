const mockSettings = {
  get: jest.fn()
};

class Setting {
  constructor(provider, key, type, defaultValue, options = {}) {
    this.provider = provider;
    this.key = key;
    this.type = type;
    this.defaultValue = defaultValue;
    this.options = options;
    this.id = `Search.${provider}.${key}`;
    this.value = undefined;
  }
  
  load() {
    const val = mockSettings.get(this.id);
    this.value = val !== undefined ? val : this.defaultValue;
  }
}

module.exports = { Setting, mockSettings };
