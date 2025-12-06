function tracerSpanMiddleware(tracer) {
  return async function(c, next) {
    const span = tracer.startSpan('http_request', {
      tags: {
        'http.method': c.req.method,
        'http.url': c.req.path
      }
    });
    
    c.span = span;
    c.res.setHeader('X-Trace-Id', span.context().toTraceId());
    
    try {
      await next();
      span.setTag('http.status_code', c.res.statusCode);
    } catch (error) {
      span.setTag('error', true);
      span.log({ event: 'error', message: error.message });
      throw error;
    } finally {
      span.finish();
    }
  };
}

module.exports = { tracerSpanMiddleware };
