const { Messages, Subscriptions, Rooms } = require('../../mocks/models');
const { settings } = require('../../mocks/settings');
const { canAccessRoomAsync } = require('../../mocks/authorization');

async function starMessage(messageId, userId, starred = true) {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Invalid message ID');
  }

  const message = await Messages.findOneById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  const room = await Rooms.findOneById(message.rid);
  if (!room) {
    throw new Error('Room not found');
  }

  const canAccess = await canAccessRoomAsync(room, { _id: userId });
  if (!canAccess) {
    throw new Error('User cannot access room');
  }

  const allowStarring = await settings.get('Message_AllowStarring');
  if (!allowStarring) {
    throw new Error('Message starring is disabled');
  }

  if (starred) {
    await Subscriptions.update(
      { rid: message.rid, 'u._id': userId },
      { $addToSet: { starred: { _id: messageId } } }
    );
  } else {
    await Subscriptions.update(
      { rid: message.rid, 'u._id': userId },
      { $pull: { starred: { _id: messageId } } }
    );
  }

  return { success: true };
}

module.exports = { starMessage };
