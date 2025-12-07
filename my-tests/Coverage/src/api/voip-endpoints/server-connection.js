async function checkManagementConnection(host, port, username, password) {
  return { success: true };
}

async function checkCallserverConnection(socketUrl) {
  return { success: true };
}

module.exports = {
  checkManagementConnection,
  checkCallserverConnection
};
