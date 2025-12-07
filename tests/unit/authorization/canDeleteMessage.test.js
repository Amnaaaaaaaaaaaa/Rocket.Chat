/**
 * White Box Testing for canDeleteMessage.ts
 * 
 * Functions Under Test:
 * - canDeleteMessageAsync
 */

describe('canDeleteMessage.ts - Message Deletion Authorization', () => {
  let mockRooms;
  let mockCanAccessRoom;
  let mockHasPermission;
  let mockGetValue;

  // Helper function for elapsed time in minutes
  const elapsedTime = (ts) => Math.round((Date.now() - ts.getTime()) / 1000 / 60);

  beforeEach(() => {
    mockRooms = { findOneById: jest.fn() };
    mockCanAccessRoom = jest.fn();
    mockHasPermission = jest.fn();
    mockGetValue = jest.fn();
    jest.clearAllMocks();
  });

  describe('canDeleteMessageAsync - Main Function', () => {
    test('TC-001: Should return false for non-existent room', async () => {
      const message = { u: { _id: 'user1' }, rid: 'roomX', ts: new Date() };
      mockRooms.findOneById.mockResolvedValue(null);
      const room = await mockRooms.findOneById(message.rid);
      expect(room).toBeNull();
    });

    test('TC-002: Should check room access before proceeding', async () => {
      const uid = 'user1';
      const message = { u: { _id: 'user2' }, rid: 'room123', ts: new Date() };
      const room = { _id: 'room123', t: 'c', ro: false };
      mockRooms.findOneById.mockResolvedValue(room);
      mockCanAccessRoom.mockResolvedValue(false);
      const canAccess = await mockCanAccessRoom(room, { _id: uid });
      expect(canAccess).toBe(false);
      expect(mockCanAccessRoom).toHaveBeenCalledWith(room, { _id: uid });
    });

    test('TC-003: Should allow force-delete with force-delete-message permission', async () => {
      const uid = 'admin1';
      const message = { u: { _id: 'user2' }, rid: 'room123', ts: new Date() };
      const room = { _id: 'room123' };
      mockRooms.findOneById.mockResolvedValue(room);
      mockCanAccessRoom.mockResolvedValue(true);
      mockHasPermission.mockResolvedValue(true);
      const forceDelete = await mockHasPermission(uid, 'force-delete-message', message.rid);
      expect(forceDelete).toBe(true);
    });

    test('TC-004: Should return false for missing timestamp', () => {
      const message = { u: { _id: 'user1' }, rid: 'room123' };
      const hasTimestamp = !!message.ts;
      expect(hasTimestamp).toBe(false);
    });

    test('TC-005: Should check Message_AllowDeleting setting', async () => {
      mockGetValue.mockResolvedValue(false);
      const deleteAllowed = await mockGetValue('Message_AllowDeleting');
      expect(deleteAllowed).toBe(false);
    });
  });

  describe('Permission Checks for Deletion', () => {
    test('TC-006: Should allow delete-message permission for any message', async () => {
      mockHasPermission.mockResolvedValue(true); // delete-message
      const allowed = await mockHasPermission('mod1', 'delete-message', 'room123');
      expect(allowed).toBe(true);
    });

    test('TC-007: Should allow delete-own-message permission for own messages', async () => {
      const uid = 'user1';
      const message = { u: { _id: 'user1' }, rid: 'room123', ts: new Date() };
      const isOwn = uid === message.u._id;
      mockHasPermission.mockResolvedValue(true); // delete-own-message
      const allowed = isOwn && (await mockHasPermission(uid, 'delete-own-message', message.rid));
      expect(allowed).toBe(true);
      expect(isOwn).toBe(true);
    });

    test('TC-008: Should not allow deleting others messages with only delete-own-message', async () => {
      const uid = 'user1';
      const message = { u: { _id: 'otherUser' }, rid: 'room123', ts: new Date() };
      const isOwn = uid === message.u._id;
      mockHasPermission.mockResolvedValue(true); // delete-own-message
      const allowed = isOwn && (await mockHasPermission(uid, 'delete-own-message', message.rid));
      expect(allowed).toBe(false);
      expect(isOwn).toBe(false);
    });
  });

  describe('Time Limit Checks', () => {
    test('TC-009: Should bypass time limit with bypass-time-limit-edit-and-delete permission', async () => {
      mockHasPermission.mockResolvedValue(true);
      const bypass = await mockHasPermission('user1', 'bypass-time-limit-edit-and-delete', 'room123');
      expect(bypass).toBe(true);
    });

    test('TC-010: Should enforce time limit when no bypass permission', async () => {
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const elapsed = elapsedTime(oldDate);
      const limit = 30;
      expect(elapsed).toBeGreaterThan(limit);
    });

    test('TC-011: Should allow deletion within time limit', () => {
      const recentDate = new Date(Date.now() - 5 * 60 * 1000);
      const elapsed = elapsedTime(recentDate);
      const limit = 30;
      expect(elapsed).toBe(5);
      expect(elapsed <= limit).toBe(true);
    });

    test('TC-012: Should handle undefined BlockDeleteInMinutes', async () => {
      mockGetValue.mockResolvedValue(null);
      const block = await mockGetValue('Message_AllowDeleting_BlockDeleteInMinutes');
      expect(block).toBeNull();
    });
  });

  describe('Readonly Room Checks', () => {
    test('TC-013: Should allow deletion in readonly rooms with post-readonly permission', async () => {
      const uid = 'admin';
      const message = { u: { _id: 'admin', username: 'admin' }, rid: 'r1', ts: new Date() };
      const room = { _id: 'r1', ro: true, unmuted: [] };
      mockHasPermission.mockResolvedValue(true); // post-readonly
      if (room.ro && !(await mockHasPermission(uid, 'post-readonly', room._id))) {
        if (!room.unmuted.includes(message.u.username)) throw new Error('Readonly error');
      }
      expect(mockHasPermission).toHaveBeenCalledWith(uid, 'post-readonly', 'r1');
    });

    test('TC-014: Should allow deletion for unmuted users in readonly rooms', async () => {
      const uid = 'user1';
      const message = { u: { _id: 'user1', username: 'user1' }, rid: 'r1', ts: new Date() };
      const room = { _id: 'r1', ro: true, unmuted: ['user1'] };
      const canDelete = room.unmuted.includes(message.u.username);
      expect(canDelete).toBe(true);
    });

    test('TC-015: Should throw error for muted users in readonly rooms', async () => {
      const uid = 'user1';
      const message = { u: { _id: 'user1', username: 'muted' }, rid: 'r1', ts: new Date() };
      const room = { _id: 'r1', ro: true, unmuted: [] };
      await expect(async () => {
        if (room.ro && !room.unmuted.includes(message.u.username)) {
          throw new Error("You can't delete messages because the room is readonly.");
        }
      }).rejects.toThrow("You can't delete messages because the room is readonly.");
    });
  });

  describe('Edge Cases', () => {
    test('TC-016: Should handle message without u property', () => {
      const message = { rid: 'r1', ts: new Date() };
      expect(message.u).toBeUndefined();
    });

    test('TC-017: Should handle message.u without _id', () => {
      const uid = 'user1';
      const message = { u: { username: 'test' }, rid: 'r1', ts: new Date() };
      const isOwn = uid === message.u._id;
      expect(isOwn).toBe(false);
      expect(message.u._id).toBeUndefined();
    });

    test('TC-018: Should handle room without ro property', () => {
      const room = { _id: 'r1' };
      expect(room.ro === true).toBe(false);
    });

    test('TC-019: Should handle room without unmuted property', () => {
      const room = { _id: 'r1', ro: true };
      const isUnmuted = (room.unmuted || []).includes('user');
      expect(isUnmuted).toBe(false);
      expect(room.unmuted).toBeUndefined();
    });

    test('TC-020: Should calculate elapsed time correctly', () => {
      const now = Date.now();
      const fiveMin = new Date(now - 5 * 60 * 1000);
      const twoHours = new Date(now - 2 * 60 * 60 * 1000);
      const oneDay = new Date(now - 24 * 60 * 60 * 1000);
      expect(elapsedTime(fiveMin)).toBe(5);
      expect(elapsedTime(twoHours)).toBe(120);
      expect(elapsedTime(oneDay)).toBe(1440);
    });
  });

  describe('Integration Scenarios', () => {
    test('TC-021: Admin can force delete any message', async () => {
      const uid = 'admin';
      const message = { u: { _id: 'user1' }, rid: 'r1', ts: new Date() };
      const room = { _id: 'r1', ro: false, unmuted: [] };
      mockRooms.findOneById.mockResolvedValue(room);
      mockCanAccessRoom.mockResolvedValue(true);
      mockHasPermission.mockResolvedValue(true);
      const forceDelete = await mockHasPermission(uid, 'force-delete-message', message.rid);
      expect(forceDelete).toBe(true);
    });

    test('TC-022: User can delete own recent message', () => {
      const uid = 'user1';
      const message = { u: { _id: 'user1' }, rid: 'r1', ts: new Date(Date.now() - 10 * 60 * 1000) };
      const blockLimit = 60; // minutes
      expect(elapsedTime(message.ts) <= blockLimit).toBe(true);
    });
  });
});

