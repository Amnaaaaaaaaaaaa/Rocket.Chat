function metricsMiddleware(settings, metrics) {
  return async function(c, next) {
    const enabled = await settings.get('Prometheus_Enabled');
    
    if (!enabled) {
      return await next();
    }
    
    const timer = metrics.startTimer();
    await next();
    timer.end();
  };
}

module.exports = { metricsMiddleware };
