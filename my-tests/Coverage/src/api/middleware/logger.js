function loggerMiddleware(logger) {
  return async function(c, next) {
    const method = c.req.method;
    const path = c.req.path;
    
    const childLogger = logger.child({ method, path });
    c.logger = childLogger;
    
    childLogger.info('Request started');
    
    const startTime = Date.now();
    await next();
    const duration = Date.now() - startTime;
    
    childLogger.info(`Request completed in ${duration}ms with status ${c.res.statusCode}`);
  };
}

module.exports = { loggerMiddleware };
