function loggerMiddleware(logger) {
  return async function(c, next) {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    
    const childLogger = logger.child({ method, path });
    c.logger = childLogger;
    
    childLogger.info('Request started');
    
    c.res.on('finish', () => {
      const duration = Date.now() - start;
      childLogger.info(`Request completed in ${duration}ms`);
    });
    
    await next();
  };
}

module.exports = { loggerMiddleware };
