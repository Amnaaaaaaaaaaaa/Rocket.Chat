/**
 * VoIP Events - White-Box Testing
 * Tests: VoIP event handling
 * Total: 10 tests
 */

const { handleVoipEvent, VoipClientEvents } = require('../src/api/voip-endpoints/events');

describe('VoIP Events - White-Box Testing', () => {
  const mockUser = { _id: 'user123', username: 'testuser' };

  test('TC-VOIP-EV-001: should handle valid VOIP_CALL_STARTED event', async () => {
    const result = await handleVoipEvent(
      VoipClientEvents.VOIP_CALL_STARTED,
      'room123',
      'Test comment',
      mockUser
    );

    expect(result.success).toBe(true);
    expect(result.event).toBe(VoipClientEvents.VOIP_CALL_STARTED);
  });

  test('TC-VOIP-EV-002: should handle valid VOIP_CALL_ENDED event', async () => {
    const result = await handleVoipEvent(
      VoipClientEvents.VOIP_CALL_ENDED,
      'room123',
      'Test comment',
      mockUser
    );

    expect(result.success).toBe(true);
    expect(result.event).toBe(VoipClientEvents.VOIP_CALL_ENDED);
  });

  test('TC-VOIP-EV-003: should return room ID in response', async () => {
    const result = await handleVoipEvent(
      VoipClientEvents.VOIP_CALL_STARTED,
      'room456',
      'Comment',
      mockUser
    );

    expect(result.rid).toBe('room456');
  });

  test('TC-VOIP-EV-004: should reject invalid event type', async () => {
    await expect(
      handleVoipEvent('invalid-event', 'room123', 'Comment', mockUser)
    ).rejects.toThrow('Invalid event type');
  });

  test('TC-VOIP-EV-005: should handle event with comment', async () => {
    const result = await handleVoipEvent(
      VoipClientEvents.VOIP_CALL_STARTED,
      'room123',
      'This is a test comment',
      mockUser
    );

    expect(result.success).toBe(true);
  });

  test('TC-VOIP-EV-006: should handle event without comment', async () => {
    const result = await handleVoipEvent(
      VoipClientEvents.VOIP_CALL_STARTED,
      'room123',
      undefined,
      mockUser
    );

    expect(result.success).toBe(true);
  });

  test('TC-VOIP-EV-007: should validate event against VoipClientEvents', async () => {
    const validEvents = Object.values(VoipClientEvents);
    
    for (const event of validEvents) {
      const result = await handleVoipEvent(event, 'room123', 'Comment', mockUser);
      expect(result.success).toBe(true);
    }
  });

  test('TC-VOIP-EV-008: should handle different room IDs', async () => {
    const roomIds = ['room1', 'room2', 'room3'];

    for (const rid of roomIds) {
      const result = await handleVoipEvent(
        VoipClientEvents.VOIP_CALL_STARTED,
        rid,
        'Comment',
        mockUser
      );
      expect(result.rid).toBe(rid);
    }
  });

  test('TC-VOIP-EV-009: should handle different users', async () => {
    const users = [
      { _id: 'user1', username: 'user1' },
      { _id: 'user2', username: 'user2' }
    ];

    for (const user of users) {
      const result = await handleVoipEvent(
        VoipClientEvents.VOIP_CALL_STARTED,
        'room123',
        'Comment',
        user
      );
      expect(result.success).toBe(true);
    }
  });

  test('TC-VOIP-EV-010: should have VOIP_CALL_STARTED in VoipClientEvents', () => {
    expect(VoipClientEvents).toHaveProperty('VOIP_CALL_STARTED');
    expect(VoipClientEvents.VOIP_CALL_STARTED).toBe('voip-call-started');
  });
});
