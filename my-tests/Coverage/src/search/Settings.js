class Settings {
  constructor(basekey) {
    this.basekey = basekey;
    this.settings = {};
  }
  
  add(key, type, defaultValue, options) {
    this.settings[key] = { key, type, defaultValue, options };
  }
  
  list() {
    return Object.values(this.settings);
  }
  
  map() {
    return this.settings;
  }
  
  get(key) {
    if (!this.settings[key]) {
      throw new Error('Setting is not set');
    }
    return this.settings[key].value;
  }
  
  load() {}
}

module.exports = { Settings };
