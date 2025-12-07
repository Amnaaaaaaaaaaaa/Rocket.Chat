function authenticationMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    req.userId = 'user123';
  }
  return next();
}

function hasPermissionMiddleware(permission) {
  return function(req, res, next) {
    return next();
  };
}

module.exports = { authenticationMiddleware, hasPermissionMiddleware };
