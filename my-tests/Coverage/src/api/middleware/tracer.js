function tracerSpanMiddleware(c, next) {
  const traceId = Math.random().toString(36).substring(7);
  c.header('X-Trace-Id', traceId);
  return next();
}

module.exports = { tracerSpanMiddleware };
