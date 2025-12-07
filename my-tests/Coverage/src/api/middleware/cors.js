function cors(settings) {
  return async function(c, next) {
    const enabled = await settings.get('API_Enable_CORS');
    if (!enabled) {
      return await next();
    }

    const origin = c.req.header('origin');
    const allowedOrigins = (await settings.get('API_CORS_Origin') || '*').toLowerCase();
    
    if (allowedOrigins === '*' || allowedOrigins.split(',').map(o => o.trim()).includes(origin?.toLowerCase())) {
      c.res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    c.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (c.req.method === 'OPTIONS') {
      return c.res.end();
    }
    
    return await next();
  };
}

module.exports = { cors };
