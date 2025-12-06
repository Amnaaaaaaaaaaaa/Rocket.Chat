const { Messages, Rooms, Users } = require('../mocks/models');
const { settings } = require('../mocks/settings');
const { hasPermissionAsync, canAccessRoomAsync } = require('../mocks/authorization');

async function pinMessage(message, user) {
  if (!message || !message._id) throw new Error('Invalid message');
  if (!user || !user._id) throw new Error('Invalid user');
  
  const room = await Rooms.findOneById(message.rid);
  if (!room) throw new Error('Room not found');
  
  const canAccess = await canAccessRoomAsync(room, user);
  if (!canAccess) throw new Error('User cannot access room');
  
  const hasPerm = await hasPermissionAsync(user._id, 'pin-message', message.rid);
  if (!hasPerm) throw new Error('No permission');
  
  return { success: true };
}

async function unpinMessage(message, user) {
  if (!message || !message._id) throw new Error('Invalid message');
  if (!user || !user._id) throw new Error('Invalid user');
  
  const hasPerm = await hasPermissionAsync(user._id, 'pin-message', message.rid);
  if (!hasPerm) throw new Error('No permission');
  
  return { success: true };
}

module.exports = { pinMessage, unpinMessage };
