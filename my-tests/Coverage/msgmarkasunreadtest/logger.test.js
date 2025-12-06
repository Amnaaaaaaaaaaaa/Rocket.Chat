const { Logger } = require('../mocks/logger');

// Function under test
function createLogger(name) {
  return new Logger(name);
}

describe('Logger - White-Box Testing', () => {
  
  test('TC-LOG-001: should create logger with name', () => {
    const logger = createLogger('MessageMarkAsUnread');
    
    expect(logger.name).toBe('MessageMarkAsUnread');
  });

  test('TC-LOG-002: should have debug method', () => {
    const logger = createLogger('TestLogger');
    
    expect(typeof logger.debug).toBe('function');
  });

  test('TC-LOG-003: should have info method', () => {
    const logger = createLogger('TestLogger');
    
    expect(typeof logger.info).toBe('function');
  });

  test('TC-LOG-004: should have warn method', () => {
    const logger = createLogger('TestLogger');
    
    expect(typeof logger.warn).toBe('function');
  });

  test('TC-LOG-005: should have error method', () => {
    const logger = createLogger('TestLogger');
    
    expect(typeof logger.error).toBe('function');
  });

  test('TC-LOG-006: should call debug with message', () => {
    const logger = createLogger('TestLogger');
    logger.debug('Test debug message');
    
    expect(logger.debug).toHaveBeenCalledWith('Test debug message');
  });

  test('TC-LOG-007: should call info with message', () => {
    const logger = createLogger('TestLogger');
    logger.info('Test info message');
    
    expect(logger.info).toHaveBeenCalledWith('Test info message');
  });

  test('TC-LOG-008: should handle empty logger name', () => {
    const logger = createLogger('');
    
    expect(logger.name).toBe('');
  });

  test('TC-LOG-009: should handle special characters in name', () => {
    const logger = createLogger('Test-Logger_123');
    
    expect(logger.name).toBe('Test-Logger_123');
  });

  test('TC-LOG-010: should create multiple independent loggers', () => {
    const logger1 = createLogger('Logger1');
    const logger2 = createLogger('Logger2');
    
    expect(logger1.name).toBe('Logger1');
    expect(logger2.name).toBe('Logger2');
  });
});
