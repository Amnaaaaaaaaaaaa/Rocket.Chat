function filter(data, filters) {
  return {};
}

function paginate(data, count, offset) {
  return {};
}

function isUserAndExtensionParams(params) {
  return {};
}

function isUserIdndTypeParams(params) {
  return {};
}

async function getFreeExtensions() {
  return { success: true };
}

async function getExtensionAllocationDetails() {
  return { success: true };
}

module.exports = {
  filter,
  paginate,
  isUserAndExtensionParams,
  isUserIdndTypeParams,
  getFreeExtensions,
  getExtensionAllocationDetails
};
