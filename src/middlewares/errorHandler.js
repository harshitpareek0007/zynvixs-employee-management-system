const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((item) => item.message);
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  if (!(err instanceof ApiError) && statusCode === 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") {
      message = "Internal server error";
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = errorHandler;
