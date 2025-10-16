const Joi = require('joi');
const { FILE_UPLOAD, USER_ROLES, PROPERTY_STATUS, TRANSFER_STATUS } = require('./constants');

// Common validation patterns
const walletAddress = Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required();
const email = Joi.string().email().max(255);
const string = Joi.string().max(255);
const text = Joi.string().max(1000);
const number = Joi.number().positive();
const id = Joi.string().required();
const coordinates = Joi.string().pattern(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/).required();

const userValidation = {
  auth: Joi.object({
    walletAddress,
    signature: Joi.string().optional(),
    message: Joi.string().optional()
  }),

  updateProfile: Joi.object({
    email: email.optional(),
    name: string.optional()
  }),

  updateRole: Joi.object({
    role: Joi.string().valid(...Object.values(USER_ROLES)).required()
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid(...Object.values(USER_ROLES)).optional(),
    search: string.optional()
  })
};

const propertyValidation = {
  register: Joi.object({
    title: string.max(200).required(),
    description: text.required(),
    location: string.max(200).required(),
    coordinates: coordinates,
    size: number.required(),
    documents: Joi.array().items(Joi.object({
      name: string.required(),
      type: Joi.string().valid(...FILE_UPLOAD.ALLOWED_FILE_TYPES).required(),
      size: Joi.number().max(FILE_UPLOAD.MAX_FILE_SIZE).required()
    })).min(1).required()
  }),

  update: Joi.object({
    title: string.max(200).optional(),
    description: text.optional()
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid(...Object.values(PROPERTY_STATUS)).optional(),
    search: string.optional()
  }),

  getById: Joi.object({
    id: id
  }),

  search: Joi.object({
    coordinates: coordinates.optional(),
    location: string.optional(),
    radius: Joi.number().min(1).max(100).default(10)
  })
};

const verificationValidation = {
  verify: Joi.object({
    approved: Joi.boolean().required(),
    comments: text.max(500).optional()
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  listAll: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    approved: Joi.boolean().optional(),
    verifierId: id.optional()
  }),

  getByProperty: Joi.object({
    propertyId: id
  })
};

const transferValidation = {
  initiate: Joi.object({
    propertyId: id,
    toWalletAddress: walletAddress
  }),

  complete: Joi.object({
    signature: Joi.string().optional()
  }),

  getById: Joi.object({
    transferId: id
  }),

  cancel: Joi.object({
    transferId: id
  })
};

const adminValidation = {
  dashboard: Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'year').default('month')
  }),

  logs: Joi.object({
    type: Joi.string().valid('all', 'registrations', 'verifications', 'transfers').default('all'),
    limit: Joi.number().integer().min(1).max(1000).default(100)
  })
};

module.exports = {
  userValidation,
  propertyValidation,
  verificationValidation,
  transferValidation,
  adminValidation
};