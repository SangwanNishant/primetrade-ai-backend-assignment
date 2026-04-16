const authService = require('./auth.service');
const { success, created } = require('../../utils/response');

/**
 * POST /api/v1/auth/register
 * Creates a new user account and returns a JWT.
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return created(res, result, 'Account created successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 * Validates credentials and returns a signed JWT.
 */
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return success(res, result, 'Login successful.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user's profile.
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, { user }, 'Profile retrieved.');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
