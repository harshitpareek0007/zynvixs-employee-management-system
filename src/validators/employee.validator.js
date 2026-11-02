const Joi = require("joi");
const validate = require("./validate");
const { DEPARTMENTS, ROLES, STATUSES } = require("../models/Employee");

const objectId = Joi.string().hex().length(24).messages({
  "string.length": "Invalid ID format",
  "string.hex": "Invalid ID format",
});

const createSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  role: Joi.string().valid(...ROLES).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    "string.pattern.base": "Phone must be a 10-digit number",
  }),
  department: Joi.string()
    .valid(...DEPARTMENTS)
    .required(),
  designation: Joi.string().trim().min(2).max(80).required(),
  salary: Joi.number().min(0).optional(),
  dateOfJoining: Joi.date().optional(),
  status: Joi.string().valid(...STATUSES).optional(),
  address: Joi.string().trim().max(200).optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(64),
  role: Joi.string().valid(...ROLES),
  phone: Joi.string().pattern(/^[0-9]{10}$/).messages({
    "string.pattern.base": "Phone must be a 10-digit number",
  }),
  department: Joi.string().valid(...DEPARTMENTS),
  designation: Joi.string().trim().min(2).max(80),
  salary: Joi.number().min(0),
  dateOfJoining: Joi.date(),
  status: Joi.string().valid(...STATUSES),
  address: Joi.string().trim().max(200).allow(""),
}).min(1);

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().allow(""),
  department: Joi.string().valid(...DEPARTMENTS),
  status: Joi.string().valid(...STATUSES),
  sort: Joi.string()
    .valid("createdAt", "-createdAt", "name", "-name", "salary", "-salary")
    .default("-createdAt"),
});

const idSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  validateCreate: validate(createSchema),
  validateUpdate: validate(updateSchema),
  validateListQuery: validate(listSchema, "query"),
  validateIdParam: validate(idSchema, "params"),
};
