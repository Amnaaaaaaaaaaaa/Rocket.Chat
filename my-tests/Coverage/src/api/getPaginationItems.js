const mockSettings = {
  get: jest.fn()
};

function getPaginationItems(params) {
  const hardUpperLimit = Math.max(mockSettings.get('API_Upper_Count_Limit') || 100, 100);
  const defaultCount = Math.max(mockSettings.get('API_Default_Count') || 50, 50);
  
  let offset = parseInt(params.offset) || 0;
  if (offset < 0) offset = 0;
  
  let count = parseInt(params.count);
  if (isNaN(count) || count === null || count === undefined) {
    count = defaultCount;
  }
  
  if (count === 0 && !params.allowInfinite) {
    count = defaultCount;
  }
  
  count = Math.min(count, hardUpperLimit);
  
  return { offset, count };
}

module.exports = { getPaginationItems, mockSettings };
