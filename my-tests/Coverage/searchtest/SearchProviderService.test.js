const { SearchProviderService, mockLogger } = require('../src/search/SearchProviderService');

class MockProvider {
  constructor(key) {
    this.key = key;
  }
  async run(reason) {
    return Promise.resolve();
  }
  stop(resolve) {
    resolve();
  }
}

describe('SearchProviderService - White-Box Testing', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SearchProviderService();
  });

  test('TC-SRV-001: should initialize with empty providers', () => {
    expect(Object.keys(service.providers).length).toBe(0);
  });

  test('TC-SRV-002: should register provider', () => {
    const provider = new MockProvider('test');
    service.register(provider);
    expect(service.providers['test']).toBe(provider);
  });

  test('TC-SRV-003: should throw error if provider not found', async () => {
    await expect(service.use('nonexistent')).rejects.toThrow('provider nonexistent cannot be found');
  });

  test('TC-SRV-004: should use provider with startup reason', async () => {
    const provider = new MockProvider('test');
    service.register(provider);
    await service.use('test');
    expect(service.activeProvider).toBe(provider);
  });

  test('TC-SRV-005: should switch providers', async () => {
    const provider1 = new MockProvider('test1');
    const provider2 = new MockProvider('test2');
    service.register(provider1);
    service.register(provider2);
    await service.use('test1');
    await service.use('test2');
    expect(service.activeProvider).toBe(provider2);
  });

  test('TC-SRV-006: should update same provider', async () => {
    const provider = new MockProvider('test');
    service.register(provider);
    await service.use('test');
    await service.use('test');
    expect(service.activeProvider).toBe(provider);
  });

  test('TC-SRV-007: should stop active provider before switching', async () => {
    const stopSpy = jest.fn((resolve) => resolve());
    const provider1 = new MockProvider('test1');
    provider1.stop = stopSpy;
    const provider2 = new MockProvider('test2');
    service.register(provider1);
    service.register(provider2);
    await service.use('test1');
    await service.use('test2');
    expect(stopSpy).toHaveBeenCalled();
  });

  test('TC-SRV-008: should log provider start', async () => {
    const provider = new MockProvider('test');
    service.register(provider);
    await service.use('test');
    expect(mockLogger.debug).toHaveBeenCalledWith("Start provider 'test'");
  });

  test('TC-SRV-009: should set activeProvider to undefined before start', async () => {
    const provider1 = new MockProvider('test1');
    const provider2 = new MockProvider('test2');
    service.register(provider1);
    service.register(provider2);
    await service.use('test1');
    
    let activeWasUndefined = false;
    const originalRun = provider2.run;
    provider2.run = async function(reason) {
      if (service.activeProvider === undefined) {
        activeWasUndefined = true;
      }
      return originalRun.call(this, reason);
    };
    
    await service.use('test2');
    expect(activeWasUndefined).toBe(true);
  });

  test('TC-SRV-010: should call start on service', async () => {
    await service.start();
    expect(mockLogger.debug).toHaveBeenCalledWith('Load data for all providers');
  });
});
