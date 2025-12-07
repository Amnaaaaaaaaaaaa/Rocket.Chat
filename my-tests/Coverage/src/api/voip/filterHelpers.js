function filter(data, filters) {
  return data.filter(item => {
    if (filters.extension && item.extension !== filters.extension) return false;
    if (filters.agentId && item.userId !== filters.agentId) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.queues && !filters.queues.some(q => item.queues?.includes(q))) return false;
    return true;
  });
}

function paginate(data, count = 10, offset = 0) {
  return data.slice(offset, offset + count);
}

function isUserAndExtensionParams(params) {
  return !!(params.userId && params.extension);
}

function isUserIdndTypeParams(params) {
  return !!(params.userId && (params.type === 'free' || params.type === 'allocated'));
}

module.exports = {
  filter,
  paginate,
  isUserAndExtensionParams,
  isUserIdndTypeParams
};
