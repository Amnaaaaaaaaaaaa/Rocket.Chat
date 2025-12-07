function getRemoteAddress(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    const count = parseInt(process.env.HTTP_FORWARDED_COUNT || '0');
    if (count > 0 && ips.length >= count) {
      return ips[ips.length - count];
    }
    return ips[0];
  }
  
  if (realIp) {
    return realIp;
  }
  
  return req.socket?.remoteAddress || req.connection?.remoteAddress;
}

module.exports = { getRemoteAddress };
