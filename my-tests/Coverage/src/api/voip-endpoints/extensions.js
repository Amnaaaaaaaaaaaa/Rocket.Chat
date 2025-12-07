async function getConnectorVersion() {
  return { success: true };
}

async function getExtensionList() {
  return { success: true };
}

async function getExtensionDetails(params) {
  return { success: true };
}

async function getRegistrationInfo(params) {
  return { success: true };
}

module.exports = {
  getConnectorVersion,
  getExtensionList,
  getExtensionDetails,
  getRegistrationInfo
};
