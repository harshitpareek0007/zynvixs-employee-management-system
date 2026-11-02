const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Sales", "Operations"];
const ROLES = ["admin", "employee"];
const STATUSES = ["active", "inactive"];

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "employee",
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone must be a 10-digit number"],
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: [true, "Department is required"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
      default: 0,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "active",
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1, status: 1 });

employeeSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

employeeSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

employeeSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = { Employee, DEPARTMENTS, ROLES, STATUSES };
