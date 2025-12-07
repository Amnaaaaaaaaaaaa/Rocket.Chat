function removeDangerousProps(query) {
  const cleaned = {};
  for (const key in query) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      cleaned[key] = query[key];
    }
  }
  return cleaned;
}

function clean(query, allowedOperators = []) {
  query = removeDangerousProps(query);
  
  for (const key in query) {
    if (key.startsWith('$') && !allowedOperators.includes(key)) {
      delete query[key];
    } else if (typeof query[key] === 'object' && query[key] !== null) {
      query[key] = clean(query[key], allowedOperators);
    }
  }
  
  return query;
}

module.exports = { removeDangerousProps, clean };
