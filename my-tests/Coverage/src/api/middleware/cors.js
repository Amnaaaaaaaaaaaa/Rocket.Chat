function cors(settings) {
  return async function corsMiddleware(c, next) {
    const origin = c.req.header('origin') || '*';
    const allowedOrigins = await settings.get('API_CORS_Origin') || '*';
    
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      c.res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    c.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (c.req.method === 'OPTIONS') {
      c.res.status(200);
      return;
    }
    
    await next();
  };
}

module.exports = { cors };
