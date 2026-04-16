const { error } = require('../utils/response');

/**
 * Middleware factory: Validates request data with a Joi schema.
 * Strips unknown keys and aborts early on first error.
 *
 * @param {Object} schema - Joi schema object
 * @param {'body'|'query'|'params'} property - Part of request to validate
 */
module.exports = function validate(schema, property = 'body') {
  return (req, res, next) => {
    const data =
      property === 'body'
        ? req.body
        : property === 'query'
        ? req.query
        : req.params;

    const { error: joiError, value } = schema.validate(data, {
      abortEarly: false,   // Return all errors at once
      stripUnknown: true,  // Remove any extra fields
      convert: true,       // Coerce types where possible
    });

    if (joiError) {
      const errors = joiError.details.map((d) => ({
        field: d.context?.label || d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return error(res, 'Validation failed', 422, errors);
    }

    // Replace request data with validated + sanitized values
    if (property === 'body') req.body = value;
    else if (property === 'query') req.query = value;
    else req.params = value;

    next();
  };
};
