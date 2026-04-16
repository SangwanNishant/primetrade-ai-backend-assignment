const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback-secret-never-use-in-production';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Signs a JWT token with the given payload.
 * @param {Object} payload - Data to encode (id, email, role)
 * @returns {string} Signed JWT token
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: EXPIRES_IN,
    issuer: 'primetrade-api',
    audience: 'primetrade-client',
  });
}

/**
 * Verifies and decodes a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET, {
    issuer: 'primetrade-api',
    audience: 'primetrade-client',
  });
}

module.exports = { signToken, verifyToken };
