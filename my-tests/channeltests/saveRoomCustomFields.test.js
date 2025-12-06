const { Match } = require('../mocks/meteor-check');
const { Meteor } = require('../mocks/meteor-meteor');
const { Rooms, Subscriptions } = require('../mocks/models');

async function saveRoomCustomFields(rid, roomCustomFields) {
  if (!Match.test(rid, String)) {
    throw new Meteor.Error('invalid-room', 'Invalid room');
  }

  if (!Match.test(roomCustomFields, Object) || Array.isArray(roomCustomFields)) {
    throw new Meteor.Error('invalid-roomCustomFields-type', 'Invalid roomCustomFields type');
  }

  const ret = await Rooms.setCustomFieldsById(rid, roomCustomFields);
  await Subscriptions.updateCustomFieldsByRoomId(rid, roomCustomFields);

  return ret;
}

describe('saveRoomCustomFields - White-Box Testing', () => {
  const validRoomId = 'room123';

  beforeEach(() => {
    jest.clearAllMocks();
    Rooms.setCustomFieldsById = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  });

  test('TC-WB-052: should throw error for invalid room ID', async () => {
    await expect(
      saveRoomCustomFields(null, {})
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-053: should throw error for empty room ID', async () => {
    await expect(
      saveRoomCustomFields('', {})
    ).rejects.toThrow('Invalid room');
  });

  test('TC-WB-054: should throw error for non-object customFields', async () => {
    await expect(
      saveRoomCustomFields(validRoomId, 'string')
    ).rejects.toThrow('Invalid roomCustomFields type');
  });

  test('TC-WB-055: should throw error for array customFields', async () => {
    await expect(
      saveRoomCustomFields(validRoomId, [])
    ).rejects.toThrow('Invalid roomCustomFields type');
  });

  test('TC-WB-056: should throw error for null customFields', async () => {
    await expect(
      saveRoomCustomFields(validRoomId, null)
    ).rejects.toThrow('Invalid roomCustomFields type');
  });

  test('TC-WB-057: should accept valid custom fields object', async () => {
    const customFields = { field1: 'value1', field2: 'value2' };
    
    await saveRoomCustomFields(validRoomId, customFields);
    
    expect(Rooms.setCustomFieldsById).toHaveBeenCalledWith(validRoomId, customFields);
  });

  test('TC-WB-058: should update subscriptions with custom fields', async () => {
    const customFields = { test: 'data' };
    
    await saveRoomCustomFields(validRoomId, customFields);
    
    expect(Subscriptions.updateCustomFieldsByRoomId).toHaveBeenCalledWith(
      validRoomId,
      customFields
    );
  });

  test('TC-WB-059: should handle empty custom fields object', async () => {
    await saveRoomCustomFields(validRoomId, {});
    
    expect(Rooms.setCustomFieldsById).toHaveBeenCalledWith(validRoomId, {});
  });

  test('TC-WB-060: should return database result', async () => {
    const mockResult = { modifiedCount: 1, acknowledged: true };
    Rooms.setCustomFieldsById.mockResolvedValue(mockResult);
    
    const result = await saveRoomCustomFields(validRoomId, { test: 'value' });
    
    expect(result).toEqual(mockResult);
  });
});
