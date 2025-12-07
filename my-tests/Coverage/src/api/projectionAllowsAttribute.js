function projectionAllowsAttribute(attributeName, options) {
  if (!options || !options.projection) {
    return true;
  }
  
  const projection = options.projection;
  
  if (projection[attributeName] === 1) {
    return true;
  }
  
  if (projection[attributeName] === 0) {
    return false;
  }
  
  const hasInclusion = Object.values(projection).some(v => v === 1);
  const hasExclusion = Object.values(projection).some(v => v === 0);
  
  if (hasInclusion) {
    return false;
  }
  
  if (hasExclusion) {
    return true;
  }
  
  return true;
}

module.exports = { projectionAllowsAttribute };
