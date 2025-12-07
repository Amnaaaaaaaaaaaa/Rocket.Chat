async function getQueueSummary() {
  return { success: true };
}

async function getQueuedCallsForThisExtension(params) {
  return { success: true };
}

async function getQueueMembership(params) {
  return { success: true };
}

module.exports = {
  getQueueSummary,
  getQueuedCallsForThisExtension,
  getQueueMembership
};
