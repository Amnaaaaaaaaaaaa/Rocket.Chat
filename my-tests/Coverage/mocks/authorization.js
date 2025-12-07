const hasPermissionAsync = jest.fn().mockResolvedValue(true);
const canAccessRoomAsync = jest.fn().mockResolvedValue(true);

module.exports = { hasPermissionAsync, canAccessRoomAsync };
