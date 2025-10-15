const Joi = require('joi');
const { FILE_UPLOAD } = require('./constants');

const userValidation = {
  auth: Joi.object({
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    signature: Joi.string().optional(),
    message: Joi.string().optional()
  }),

  updateProfile: Joi.object({
    email: Joi.string().email().optional(),
    name: Joi.string().max(100).optional()
  })
};

const propertyValidation = {
  register: Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000).required(),
    location: Joi.string().max(200).required(),
    coordinates: Joi.string().max(100).required(),
    size: Joi.number().positive().required(),
    documents: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      type: Joi.string().valid(...FILE_UPLOAD.ALLOWED_FILE_TYPES).required(),
      size: Joi.number().max(FILE_UPLOAD.MAX_FILE_SIZE).required()
    })).min(1).required()
  }),

  update: Joi.object({
    title: Joi.string().max(200).optional(),
    description: Joi.string().max(1000).optional()
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED', 'TRANSFERRING').optional(),
    search: Joi.string().max(100).optional()
  })
};

const verificationValidation = {
  verify: Joi.object({
    approved: Joi.boolean().required(),
    comments: Joi.string().max(500).optional()
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

const transferValidation = {
  initiate: Joi.object({
    propertyId: Joi.string().required(),
    toWalletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
  }),

  complete: Joi.object({
    signature: Joi.string().optional()
  })
};

const adminValidation = {
  updateRole: Joi.object({
    role: Joi.string().valid('CITIZEN', 'VERIFIER', 'ADMIN').required()
  })
};

module.exports = {
  userValidation,
  propertyValidation,
  verificationValidation,
  transferValidation,
  adminValidation
};