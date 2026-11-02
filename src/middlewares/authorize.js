const ApiError = require("../utils/ApiError");

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You are not allowed to perform this action"));
  }

  next();
};

module.exports = authorize;
