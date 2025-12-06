function getRemoteAddress(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return req.connection?.remoteAddress || '127.0.0.1';
}

module.exports = { getRemoteAddress };
