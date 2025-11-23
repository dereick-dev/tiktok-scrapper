const { ValidationError } = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      throw new ValidationError('Validation failed', errors);
    }
    
    next();
  };
};

module.exports = validate;