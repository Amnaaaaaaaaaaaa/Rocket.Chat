function paginate(items, count = 25, offset = 0) {
  return items.slice(offset, offset + count);
}

function isUserAndExtensionParams(params) {
  return params && typeof params.userId === 'string' && typeof params.extension === 'string';
}

function isUserIdndTypeParams(params) {
  return params && typeof params.userId === 'string' && typeof params.type === 'string';
}

module.exports = { paginate, isUserAndExtensionParams, isUserIdndTypeParams };
