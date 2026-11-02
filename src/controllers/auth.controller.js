const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { registerEmployee, loginEmployee } = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const data = await registerEmployee(req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful",
    data,
  });
});

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

const login = asyncHandler(async (req, res) => {
  const data = await loginEmployee(req.body);

  res.cookie("token", data.token, cookieOptions);

  sendSuccess(res, {
    message: "Login successful",
    data,
  });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: "Current employee profile",
    data: req.user.toSafeObject(),
  });
});

module.exports = {
  register,
  login,
  me,
};
