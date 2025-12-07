const mockNormalizeMessagesForUser = jest.fn();

async function composeRoomWithLastMessage(room, userId) {
  if (!room.lastMessage) {
    return room;
  }
  
  const normalized = await mockNormalizeMessagesForUser([room.lastMessage], userId);
  
  return {
    ...room,
    lastMessage: normalized[0]
  };
}

module.exports = { composeRoomWithLastMessage, mockNormalizeMessagesForUser };
