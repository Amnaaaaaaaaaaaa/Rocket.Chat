function isValidQuery(query, allowedAttributes, allowedOperations) {
  if (typeof query !== 'object' || query === null) {
    throw new Error('query must be an object');
  }
  
  isValidQuery.errors = [];
  
  const isValid = Object.keys(query).every(key => {
    if (key.startsWith('$')) {
      if (!allowedOperations.includes(key)) {
        isValidQuery.errors.push(`Invalid operation: ${key}`);
        return false;
      }
    } else {
      if (!allowedAttributes.includes('*') && 
          !allowedAttributes.includes(key) &&
          !allowedAttributes.some(attr => attr.endsWith('.*') && key.startsWith(attr.replace('.*', '')))) {
        isValidQuery.errors.push(`Invalid attribute: ${key}`);
        return false;
      }
    }
    return true;
  });
  
  return isValid;
}

isValidQuery.errors = [];

module.exports = { isValidQuery };
