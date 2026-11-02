const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../services/employee.service");

const create = asyncHandler(async (req, res) => {
  const employee = await createEmployee(req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: "Employee created",
    data: employee,
  });
});

const list = asyncHandler(async (req, res) => {
  const data = await listEmployees(req.query);
  sendSuccess(res, {
    message: "Employees fetched",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const employee = await getEmployeeById(req.params.id, req.user);
  sendSuccess(res, {
    message: "Employee fetched",
    data: employee,
  });
});

const update = asyncHandler(async (req, res) => {
  const employee = await updateEmployee(req.params.id, req.body);
  sendSuccess(res, {
    message: "Employee updated",
    data: employee,
  });
});

const remove = asyncHandler(async (req, res) => {
  const employee = await deleteEmployee(req.params.id);
  sendSuccess(res, {
    message: "Employee deleted",
    data: employee,
  });
});

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
};
