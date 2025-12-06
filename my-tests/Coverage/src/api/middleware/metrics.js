function metricsMiddleware(settings, metrics) {
  return async function(c, next) {
    const enabled = await settings.get('Prometheus_Enabled');
    
    if (!enabled) {
      return await next();
    }
    
    const path = c.req.path.replace(/\/[0-9a-f]{24}/g, '/:id');
    const method = c.req.method;
    
    const summary = metrics.httpRequestDuration;
    const endTimer = summary.startTimer({ method, path });
    
    await next();
    
    endTimer();
  };
}

module.exports = { metricsMiddleware };
