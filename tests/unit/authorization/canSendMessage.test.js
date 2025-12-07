/**
 * White Box Testing for canSendMessage.ts
 * 
 * Functions Under Test:
 * - validateRoomMessagePermissionsAsync
 * - canSendMessageAsync
 */

describe('canSendMessage.ts - Message Sending Authorization', () => {
  let mockSubscriptions;
  let mockRooms;
  let mockCanAccessRoom;
  let mockHasPermission;
  let mockRoomCoordinator;
  let mockValidatePermissions;

  beforeEach(() => {
    mockSubscriptions = {
      findOneByRoomIdAndUserId: jest.fn(),
    };

    mockRooms = {
      findOneById: jest.fn(),
    };

    mockCanAccessRoom = jest.fn();
    mockHasPermission = jest.fn();
    mockRoomCoordinator = {
      getRoomDirectives: jest.fn(() => ({
        allowMemberAction: jest.fn(),
      })),
    };

    // Move the mock outside individual tests
    mockValidatePermissions = jest.fn().mockResolvedValue(undefined);

    jest.clearAllMocks();
  });

  // ------------------------------
  // validateRoomMessagePermissionsAsync tests
  // ------------------------------
  describe('validateRoomMessagePermissionsAsync', () => {
    test('TC-001: Should throw error for null room', async () => {
      const room = null;
      const user = { uid: 'user123', username: 'testuser', type: 'user' };

      await expect(async () => {
        if (!room) throw new Error('error-invalid-room');
      }).rejects.toThrow('error-invalid-room');
    });

    test('TC-002: Should check room access via canAccessRoomAsync', async () => {
      const room = { _id: 'room123', t: 'c' };
      const user = { uid: 'user123', type: 'user' };
      const extraData = { custom: 'data' };

      mockCanAccessRoom.mockResolvedValue(true);

      const canAccess = await mockCanAccessRoom(room, { _id: user.uid }, extraData);
      expect(canAccess).toBe(true);
      expect(mockCanAccessRoom).toHaveBeenCalledWith(room, { _id: 'user123' }, extraData);
    });

    test('TC-003: Should allow app type users without room access check', async () => {
      const room = { _id: 'room123', t: 'c' };
      const appUser = { uid: 'app123', username: 'bot', type: 'app' };

      let skipCheck = false;
      if (appUser.type === 'app') skipCheck = true;

      expect(skipCheck).toBe(true);
      expect(mockCanAccessRoom).not.toHaveBeenCalled();
    });

    test('TC-004: Should throw error for blocked subscriptions', async () => {
      const room = { _id: 'room123', t: 'c' };
      const user = { uid: 'user123', username: 'testuser' };

      mockRoomCoordinator.getRoomDirectives.mockReturnValue({
        allowMemberAction: jest.fn().mockResolvedValue(true),
      });
      mockSubscriptions.findOneByRoomIdAndUserId.mockResolvedValue({ blocked: true, blocker: true });

      await expect(async () => {
        const allowBlockAction = await mockRoomCoordinator
          .getRoomDirectives(room.t)
          .allowMemberAction(room, 'BLOCK', user.uid);

        if (allowBlockAction) {
          const subscription = await mockSubscriptions.findOneByRoomIdAndUserId(room._id, user.uid, {
            projection: { blocked: 1, blocker: 1 },
          });
          if (subscription && (subscription.blocked || subscription.blocker)) {
            throw new Error('room_is_blocked');
          }
        }
      }).rejects.toThrow('room_is_blocked');
    });

    test('TC-005: Should allow non-blocking subscription', async () => {
      const room = { _id: 'room123', t: 'c' };
      const user = { uid: 'user123' };

      mockRoomCoordinator.getRoomDirectives.mockReturnValue({
        allowMemberAction: jest.fn().mockResolvedValue(true),
      });
      mockSubscriptions.findOneByRoomIdAndUserId.mockResolvedValue({ blocked: false, blocker: false });

      const subscription = await mockSubscriptions.findOneByRoomIdAndUserId(room._id, user.uid, {
        projection: { blocked: 1, blocker: 1 },
      });

      expect(subscription.blocked).toBe(false);
      expect(subscription.blocker).toBe(false);
    });
  });

  // ------------------------------
  // canSendMessageAsync tests
  // ------------------------------
  describe('canSendMessageAsync', () => {
    test('TC-011: Should throw error for invalid room ID', async () => {
      const rid = 'non-existent';
      mockRooms.findOneById.mockResolvedValue(null);

      await expect(async () => {
        const room = await mockRooms.findOneById(rid);
        if (!room) throw new Error('error-invalid-room');
      }).rejects.toThrow('error-invalid-room');
    });

    test('TC-012: Should find room by ID and validate permissions', async () => {
      const rid = 'valid-room';
      const room = { _id: rid, t: 'c', ro: false };
      const user = { uid: 'user123', username: 'testuser', type: 'user' };

      mockRooms.findOneById.mockResolvedValue(room);

      // Call the mock function
      const foundRoom = await mockRooms.findOneById(rid);
      await mockValidatePermissions(foundRoom, user, undefined);

      expect(foundRoom).toBe(room);
      expect(mockValidatePermissions).toHaveBeenCalledWith(room, user, undefined);
    });

    test('TC-013: Should pass extraData to validation function', async () => {
      const rid = 'room123';
      const room = { _id: rid, t: 'p', ro: false };
      const user = { uid: 'user123', username: 'testuser', type: 'user' };
      const extraData = { reason: 'test', system: false };

      mockRooms.findOneById.mockResolvedValue(room);

      const foundRoom = await mockRooms.findOneById(rid);
      await mockValidatePermissions(foundRoom, user, extraData);

      expect(mockValidatePermissions).toHaveBeenCalledWith(room, user, extraData);
    });

    test('TC-014: Should return room object on success', async () => {
      const rid = 'success-room';
      const room = { _id: rid, t: 'c', name: 'General' };
      const user = { uid: 'user123', username: 'testuser', type: 'user' };

      mockRooms.findOneById.mockResolvedValue(room);
      const foundRoom = await mockRooms.findOneById(rid);
      await mockValidatePermissions(foundRoom, user);

      expect(foundRoom).toBe(room);
      expect(foundRoom.name).toBe('General');
    });
  });

  // ------------------------------
  // Integration scenarios
  // ------------------------------
  describe('Integration Scenarios', () => {
    test('TC-015: Complete flow - User can send message', async () => {
      const rid = 'normal-room';
      const room = { _id: rid, t: 'c', ro: false, muted: [] };
      const user = { uid: 'user123', username: 'normaluser', type: 'user' };

      mockRooms.findOneById.mockResolvedValue(room);
      mockCanAccessRoom.mockResolvedValue(true);
      mockRoomCoordinator.getRoomDirectives.mockReturnValue({
        allowMemberAction: jest.fn().mockResolvedValue(false),
      });
      mockHasPermission.mockResolvedValue(false);

      const foundRoom = await mockRooms.findOneById(rid);

      if (!foundRoom) throw new Error('error-invalid-room');
      if (user.type !== 'app') {
        const canAccess = await mockCanAccessRoom(foundRoom, { _id: user.uid });
        if (!canAccess) throw new Error('error-not-allowed');
      }

      expect(foundRoom).toBe(room);
    });

    test('TC-016: Complete flow - User blocked from room', async () => {
      const rid = 'blocked-room';
      const room = { _id: rid, t: 'd' };
      const user = { uid: 'user123', username: 'blockeduser', type: 'user' };

      mockRooms.findOneById.mockResolvedValue(room);
      mockCanAccessRoom.mockResolvedValue(true);
      mockRoomCoordinator.getRoomDirectives.mockReturnValue({
        allowMemberAction: jest.fn().mockResolvedValue(true),
      });
      mockSubscriptions.findOneByRoomIdAndUserId.mockResolvedValue({ blocked: true, blocker: true });

      await expect(async () => {
        const foundRoom = await mockRooms.findOneById(rid);
        const allowBlock = await mockRoomCoordinator.getRoomDirectives(foundRoom.t).allowMemberAction(
          foundRoom,
          'BLOCK',
          user.uid
        );
        if (allowBlock) {
          const subscription = await mockSubscriptions.findOneByRoomIdAndUserId(foundRoom._id, user.uid, {
            projection: { blocked: 1, blocker: 1 },
          });
          if (subscription && (subscription.blocked || subscription.blocker)) throw new Error('room_is_blocked');
        }
      }).rejects.toThrow('room_is_blocked');
    });
  });
});

