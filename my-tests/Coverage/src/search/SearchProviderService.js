const mockLogger = {
  debug: jest.fn()
};

class SearchProviderService {
  constructor() {
    this.providers = {};
    this.activeProvider = null;
  }
  
  register(provider) {
    this.providers[provider.key] = provider;
  }
  
  async use(key) {
    const provider = this.providers[key];
    if (!provider) {
      throw new Error(\`provider \${key} cannot be found\`);
    }
    
    if (this.activeProvider) {
      this.activeProvider.stop(() => {});
    }
    
    this.activeProvider = undefined;
    mockLogger.debug(\`Start provider '\${key}'\`);
    await provider.run('startup');
    this.activeProvider = provider;
  }
  
  async start() {
    mockLogger.debug('Load data for all providers');
  }
}

module.exports = { SearchProviderService, mockLogger };
