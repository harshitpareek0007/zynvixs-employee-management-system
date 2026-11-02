const { Employee } = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const createEmployee = async (payload) => {
  const existing = await Employee.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "email already exists");
  }

  const employee = await Employee.create(payload);
  return employee.toSafeObject();
};

const listEmployees = async (query) => {
  const { page, limit, search, department, status, sort } = query;
  const filter = {};

  if (department) {
    filter.department = department;
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Employee.find(filter).sort(sort).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => item.toSafeObject()),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getEmployeeById = async (id, requester) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const isSelf = requester._id.toString() === employee._id.toString();
  if (requester.role !== "admin" && !isSelf) {
    throw new ApiError(403, "You are not allowed to view this employee");
  }

  return employee.toSafeObject();
};

const updateEmployee = async (id, payload) => {
  const employee = await Employee.findById(id).select("+password");
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (payload.email) {
    const duplicate = await Employee.findOne({
      email: payload.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new ApiError(409, "email already exists");
    }
  }

  Object.assign(employee, payload);
  await employee.save();
  return employee.toSafeObject();
};

const deleteEmployee = async (id) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee.toSafeObject();
};

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
