const Joi = require('joi');

/**
 * Middleware para validar dados de entrada usando Joi
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      console.error('--- ERRO DE VALIDAÇÃO ---');
      error.details.forEach(detail => console.error(detail.message));
      console.error('--------------------------');
      
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Schemas de validação
const tripSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().allow('').max(500),
  startDate: Joi.date().iso().required().custom((value, helpers) => {
    // Cria a data de 'hoje' em UTC para uma comparação justa
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if (value < todayUTC) {
      // Se a data de início for anterior a hoje, retorna um erro
      return helpers.message('"startDate" must be today or a future date');
    }
    return value; // Se a validação passar, retorna o valor original
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  destination: Joi.string().required().min(1).max(300),
  photo: Joi.string().uri().required().messages({
    'string.empty': 'A foto da viagem é obrigatória.',
    'any.required': 'A foto da viagem é obrigatória.',
    'string.uri': 'O link da foto da viagem deve ser um URL válido.'
  })
});

const roadmapDaySchema = Joi.object({
  date: Joi.date().iso().required(),
  title: Joi.string().optional().max(100),
  description: Joi.string().optional().max(500)
});

const placeSchema = Joi.object({
  placeId: Joi.string().required(),
  name: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  rating: Joi.number().min(0).max(5).optional().allow(null),
  types: Joi.array().items(Joi.string()).optional(),
  order: Joi.number().integer().min(0).optional()
}).options({ stripUnknown: false });

const roadmapBudgetSchema = Joi.object({
  totalBudget: Joi.number().positive().required(),
  currency: Joi.string().default('BRL')
});

const checklistSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  items: Joi.array().items(Joi.object({
    text: Joi.string().required(),
    completed: Joi.boolean().default(false)
  })).optional()
});

const favoriteSchema = Joi.object({
  placeId: Joi.string().required(),
  name: Joi.string().required(),
  address: Joi.string().optional().allow(''),
  rating: Joi.number().min(0).max(5).optional(),
  type: Joi.string().optional().allow('', null),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).optional()
});

const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().required().min(1).max(1000),
  visitDate: Joi.date().iso().optional()
});

const sitePostSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  content: Joi.string().required().min(1),
  imageUrl: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('draft', 'pending', 'approved', 'rejected').default('draft')
});

module.exports = {
  validate,
  tripSchema,
  roadmapDaySchema,
  placeSchema,
  roadmapBudgetSchema,
  checklistSchema,
  favoriteSchema,
  reviewSchema,
  sitePostSchema
}; 