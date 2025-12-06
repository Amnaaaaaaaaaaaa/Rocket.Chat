async function authenticationMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = { _id: 'user123', username: 'testuser' };
  next();
}

async function hasPermissionMiddleware(permission) {
  return async function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const hasPermission = true; // Mock implementation
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

module.exports = { authenticationMiddleware, hasPermissionMiddleware };
