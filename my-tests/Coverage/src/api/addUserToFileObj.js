const mockUsers = {
  findByIds: jest.fn()
};

async function addUserToFileObj(files) {
  const userIds = files
    .map(f => f.userId)
    .filter(id => typeof id === 'string');
  
  if (userIds.length === 0) return files;
  
  const users = await mockUsers.findByIds(userIds, { projection: { username: 1, name: 1 } }).toArray();
  const userMap = new Map(users.map(u => [u._id, u]));
  
  return files.map(file => ({
    ...file,
    user: userMap.get(file.userId)
  }));
}

module.exports = { addUserToFileObj, mockUsers };
