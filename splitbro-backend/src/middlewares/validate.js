import ApiError from '../utils/ApiError.js';

const validate = (schema) => (req, res, next) => {
  if (!schema) return next();
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};

export default validate;
