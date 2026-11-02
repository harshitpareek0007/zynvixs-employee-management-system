const Joi = require("joi");
const validate = require("./validate");
const { DEPARTMENTS } = require("../models/Employee");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    "string.pattern.base": "Phone must be a 10-digit number",
  }),
  department: Joi.string()
    .valid(...DEPARTMENTS)
    .required(),
  designation: Joi.string().trim().min(2).max(80).required(),
  salary: Joi.number().min(0).optional(),
  dateOfJoining: Joi.date().optional(),
  address: Joi.string().trim().max(200).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
};
