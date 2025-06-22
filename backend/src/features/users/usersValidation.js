const Joi = require('joi');

const userProfileCreateSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  cpfCnpj: Joi.string().pattern(/^(\d{11}|\d{14})$/).required(),
  userType: Joi.string().valid('traveler', 'partner', 'admin').required(),
  avatarUrl: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  password: Joi.string().optional()
});

const userProfileUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  cpfCnpj: Joi.string().pattern(/^(\d{11}|\d{14})$/).optional(),
  userType: Joi.string().valid('traveler', 'partner', 'admin').required(),
  avatarUrl: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  password: Joi.string().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/).required()
    .messages({
      'string.pattern.base': 'A nova senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
      'string.min': 'A nova senha deve ter pelo menos 8 caracteres'
    })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = { validate, userProfileCreateSchema, userProfileUpdateSchema, changePasswordSchema }; 