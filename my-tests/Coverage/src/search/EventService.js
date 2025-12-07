const mockSearchProviderService = {
  activeProvider: null
};

const mockLogger = {
  debug: jest.fn()
};

class EventService {
  constructor(searchProviderService, logger) {
    this.searchProviderService = searchProviderService;
    this.logger = logger;
  }
  
  promoteEvent(event, id, payload) {
    const provider = this.searchProviderService.activeProvider;
    if (!provider) {
      this.logger.debug(\`Error on event '\${event}' with id '\${id}'\`);
      return;
    }
    
    const result = provider.on(event, id);
    if (!result) {
      this.logger.debug(\`Error on event '\${event}' with id '\${id}'\`);
    }
  }
}

module.exports = { EventService, mockSearchProviderService, mockLogger };
