const { error } = require('../utils/response');

/**
 * Middleware factory: Role-based access control guard.
 * Must be used AFTER authenticate middleware.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 * @example
 *   router.delete('/:id', authenticate, authorize('admin'), controller.delete);
 */
module.exports = function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Access denied. This endpoint requires role: ${roles.join(' or ')}.`,
        403
      );
    }

    next();
  };
};
