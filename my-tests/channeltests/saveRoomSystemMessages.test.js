const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Rooms } = require('../mocks/models');

const messageTypesValues = [
  { key: 'uj' },
  { key: 'ul' },
  { key: 'ru' },
  { key: 'au' },
  { key: 'r' },
  { key: 'ut' }
];

async function saveRoomSystemMessages(rid, systemMessages) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }
  
  if (systemMessages) {
    // First check if it's array
    if (!Array.isArray(systemMessages)) {
      throw new Meteor.Error('invalid-room', 'Invalid option');
    }
    
    // Then validate array contents
    if (!Match.test(systemMessages, [String])) {
      throw new Meteor.Error('invalid-room', 'Invalid option');
    }
    
    // Finally check valid message types
    if (systemMessages.some((value) => !messageTypesValues.map(({ key }) => key).includes(value))) {
      throw new Meteor.Error('invalid-room', 'Invalid option');
    }
  }
  
  return Rooms.setSystemMessagesById(rid, systemMessages);
}

describe('saveRoomSystemMessages - White-Box Testing', () => {
  const validRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
    Rooms.setSystemMessagesById = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  });

  test('TC-WB-061: should throw error for invalid room ID', async () => {
    await expect(
      saveRoomSystemMessages(null, ['uj'])
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-062: should throw error for non-array systemMessages', async () => {
    await expect(
      saveRoomSystemMessages(validRoomId, 'string')
    ).rejects.toThrow('Invalid option');
  });

  test('TC-WB-063: should throw error for invalid message type', async () => {
    await expect(
      saveRoomSystemMessages(validRoomId, ['invalid'])
    ).rejects.toThrow('Invalid option');
  });

  test('TC-WB-064: should accept valid message types', async () => {
    await saveRoomSystemMessages(validRoomId, ['uj', 'ul']);
    
    expect(Rooms.setSystemMessagesById).toHaveBeenCalledWith(validRoomId, ['uj', 'ul']);
  });

  test('TC-WB-065: should handle empty array', async () => {
    await saveRoomSystemMessages(validRoomId, []);
    
    expect(Rooms.setSystemMessagesById).toHaveBeenCalledWith(validRoomId, []);
  });

  test('TC-WB-066: should validate each message type in array', async () => {
    await expect(
      saveRoomSystemMessages(validRoomId, ['uj', 'invalid', 'ul'])
    ).rejects.toThrow('Invalid option');
  });

  test('TC-WB-067: should return database result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.setSystemMessagesById.mockResolvedValue(mockResult);
    
    const result = await saveRoomSystemMessages(validRoomId, ['uj']);
    
    expect(result).toEqual(mockResult);
  });
});
