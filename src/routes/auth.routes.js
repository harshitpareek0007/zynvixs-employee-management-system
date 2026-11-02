const express = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../validators/auth.validator");
const authenticate = require("../middlewares/auth");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authenticate, me);

module.exports = router;
