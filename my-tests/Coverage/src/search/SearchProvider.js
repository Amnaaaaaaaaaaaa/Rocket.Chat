const mockLogger = {
  info: jest.fn(),
  debug: jest.fn()
};

class SearchProvider {
  constructor(key) {
    this.key = key;
    this.iconName = 'magnifier';
    this.resultTemplate = 'DefaultSearchResultTemplate';
    this.suggestionItemTemplate = 'DefaultSuggestionItemTemplate';
    this.supportsSuggestions = false;
    this._settings = {};
    mockLogger.info(\`create search provider \${key}\`);
  }
  
  suggest(text, context, payload, callback) {
    callback(null, []);
  }
  
  on(event, value) {
    return true;
  }
  
  async start(reason, resolve, reject) {
    resolve();
  }
  
  stop(resolve) {
    resolve();
  }
  
  async run(reason) {
    this._settings = {};
  }
  
  get settings() {
    return [];
  }
}

module.exports = { SearchProvider, mockLogger };
