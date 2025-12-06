const { Messages, Subscriptions, Rooms } = require('../mocks/models');
const { settings } = require('../mocks/settings');
const { canAccessRoomAsync } = require('../mocks/authorization');

async function starMessage(message, user, starred = true) {
  if (!message || !message._id) throw new Error('Invalid message');
  if (!user || !user._id) throw new Error('Invalid user');
  
  const allowStarring = await settings.get('Message_AllowStarring');
  if (!allowStarring) throw new Error('Message starring is disabled');
  
  const room = await Rooms.findOneById(message.rid);
  if (!room) throw new Error('Room not found');
  
  const canAccess = await canAccessRoomAsync(room, user);
  if (!canAccess) throw new Error('User cannot access room');
  
  return { success: true };
}

module.exports = { starMessage };
