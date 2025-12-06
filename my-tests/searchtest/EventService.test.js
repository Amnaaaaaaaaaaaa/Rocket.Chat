const { EventService, mockSearchProviderService, mockLogger } = require('../src/search/EventService');

describe('EventService - White-Box Testing', () => {
  let eventService;

  beforeEach(() => {
    jest.clearAllMocks();
    eventService = new EventService();
    mockSearchProviderService.activeProvider = null;
  });

  test('TC-EVT-001: should push error if no active provider', () => {
    eventService.promoteEvent('test.event', 'id123');
    expect(mockLogger.debug).toHaveBeenCalledWith("Error on event 'test.event' with id 'id123'");
  });

  test('TC-EVT-002: should not push error if provider handles event', () => {
    mockSearchProviderService.activeProvider = {
      on: jest.fn().mockReturnValue(true)
    };
    eventService.promoteEvent('test.event', 'id123');
    expect(mockLogger.debug).not.toHaveBeenCalled();
  });

  test('TC-EVT-003: should call provider.on with correct parameters', () => {
    const mockOn = jest.fn().mockReturnValue(true);
    mockSearchProviderService.activeProvider = { on: mockOn };
    eventService.promoteEvent('message.save', 'msg123', { data: 'test' });
    expect(mockOn).toHaveBeenCalledWith('message.save', 'msg123');
  });

  test('TC-EVT-004: should push error if provider.on returns false', () => {
    mockSearchProviderService.activeProvider = {
      on: jest.fn().mockReturnValue(false)
    };
    eventService.promoteEvent('test.event', 'id123');
    expect(mockLogger.debug).toHaveBeenCalled();
  });

  test('TC-EVT-005: should handle undefined payload', () => {
    eventService.promoteEvent('test.event', 'id123', undefined);
    expect(mockLogger.debug).toHaveBeenCalled();
  });
});
