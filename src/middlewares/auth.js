const jwt = require("jsonwebtoken");
const { Employee } = require("../models/Employee");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, bearerToken] = header.split(" ");
  const token =
    (scheme === "Bearer" && bearerToken) || req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const employee = await Employee.findById(decoded.id);

  if (!employee) {
    throw new ApiError(401, "Account no longer exists");
  }

  req.user = employee;
  next();
});

module.exports = authenticate;
