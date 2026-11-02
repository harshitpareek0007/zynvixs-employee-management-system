const jwt = require("jsonwebtoken");
const { Employee } = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const signToken = (employeeId) => {
  return jwt.sign({ id: employeeId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

const registerEmployee = async (payload) => {
  const existing = await Employee.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "email already exists");
  }

  const employee = await Employee.create({
    ...payload,
    role: "employee",
  });

  const token = signToken(employee._id);
  return { employee: employee.toSafeObject(), token };
};

const loginEmployee = async ({ email, password }) => {
  const employee = await Employee.findOne({ email: email.toLowerCase() }).select("+password");

  if (!employee || !(await employee.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(employee._id);
  const safeEmployee = employee.toSafeObject();
  return { employee: safeEmployee, token };
};

module.exports = {
  registerEmployee,
  loginEmployee,
};
