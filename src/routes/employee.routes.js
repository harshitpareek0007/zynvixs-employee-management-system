const express = require("express");
const {
  create,
  list,
  getById,
  update,
  remove,
} = require("../controllers/employee.controller");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const {
  validateCreate,
  validateUpdate,
  validateListQuery,
  validateIdParam,
} = require("../validators/employee.validator");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("admin"), validateCreate, create);
router.get("/", authorize("admin"), validateListQuery, list);
router.get("/:id", validateIdParam, getById);
router.put("/:id", authorize("admin"), validateIdParam, validateUpdate, update);
router.delete("/:id", authorize("admin"), validateIdParam, remove);

module.exports = router;
