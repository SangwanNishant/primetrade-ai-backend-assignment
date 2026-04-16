const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

/**
 * Middleware: Verifies JWT from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user on success.
 */
module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(
      res,
      'Authentication required. Please provide a valid Bearer token.',
      401
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token has expired. Please login again.', 401);
    }
    return error(res, 'Invalid or malformed token.', 401);
  }
};
