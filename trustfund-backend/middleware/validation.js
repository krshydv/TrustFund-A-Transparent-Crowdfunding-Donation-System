const Joi = require('joi');

/* ===========================================
   USER REGISTRATION VALIDATION
=========================================== */
exports.validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
      .required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  next();
};

/* ===========================================
   USER LOGIN VALIDATION
=========================================== */
exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  next();
};

/* ===========================================
   CAMPAIGN CREATION VALIDATION
=========================================== */
exports.validateCampaign = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(10).max(255).required(),
    description: Joi.string().min(50).max(5000).required(),
    story: Joi.string().max(10000).optional(),
    goalAmount: Joi.number().min(1000).required(),
    categoryId: Joi.string().required(),   // frontend sends categoryId
    endDate: Joi.date().greater('now').required(),
    location: Joi.string().max(255).optional(),
    beneficiaryName: Joi.string().max(255).optional(),
    tags: Joi.array().items(Joi.string()).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  next();
};

/* ===========================================
   DONATION VALIDATION  (FIXED!)
=========================================== */
// Donation Validation
exports.validateDonation = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number().min(10).required()
      .messages({
        'number.min': 'Minimum donation amount is ₹10',
        'any.required': 'Amount is required'
      }),
    donorName: Joi.string().min(2).max(255).required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'any.required': 'Donor name is required'
      }),
    donorEmail: Joi.string().email().required()
      .messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required'
      }),
    donorPhone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    isAnonymous: Joi.boolean().optional(),
    message: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  next();
};




/* ===========================================
   EMAIL VALIDATION
=========================================== */
exports.validateEmail = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  next();
};

/* ===========================================
   PASSWORD RESET VALIDATION
=========================================== */
exports.validatePasswordReset = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
      .required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  next();
};

/* ===========================================
   CAMPAIGN UPDATE VALIDATION
=========================================== */
exports.validateCampaignUpdate = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(10).max(200).optional(),
    content: Joi.string().min(20).max(2000).optional(),
    isPublic: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  next();
};
