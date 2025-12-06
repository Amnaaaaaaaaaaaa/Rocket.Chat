const hasPermissionAsync = jest.fn(async () => true);
const canAccessRoomAsync = jest.fn(async () => true);

module.exports = {
  hasPermissionAsync,
  canAccessRoomAsync
};
