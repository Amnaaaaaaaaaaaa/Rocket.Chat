#!/bin/bash

# 1. message-pin/pinMessage.js
cat > src/message-pin/pinMessage.js << 'PINEOF'
const { Messages, Rooms, Users } = require('../../mocks/models');
const { settings } = require('../../mocks/settings');
const { hasPermissionAsync, canAccessRoomAsync } = require('../../mocks/authorization');

async function pinMessage(messageId, userId) {
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

  const hasPermission = await hasPermissionAsync(userId, 'pin-message', message.rid);
  if (!hasPermission) {
    throw new Error('User does not have permission to pin messages');
  }

  const pinnedAt = new Date();
  const pinnedBy = await Users.findOneById(userId);
  
  await Messages.update({ _id: messageId }, { 
    $set: { 
      pinned: true,
      pinnedAt,
      pinnedBy: { _id: pinnedBy._id, username: pinnedBy.username }
    }
  });

  return { success: true };
}

async function unpinMessage(messageId, userId) {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Invalid message ID');
  }

  const message = await Messages.findOneById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  const hasPermission = await hasPermissionAsync(userId, 'pin-message', message.rid);
  if (!hasPermission) {
    throw new Error('User does not have permission to unpin messages');
  }

  await Messages.update({ _id: messageId }, { 
    $unset: { pinned: '', pinnedAt: '', pinnedBy: '' }
  });

  return { success: true };
}

module.exports = { pinMessage, unpinMessage };
PINEOF

# 2. message-star/starMessage.js
cat > src/message-star/starMessage.js << 'STAREOF'
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
STAREOF

echo "✅ Created message-pin and message-star files"
echo "⚠️  Abhi 28 aur files banani hain..."
echo ""
echo "Kya main baki files bhi bana doon? (y/n)"
