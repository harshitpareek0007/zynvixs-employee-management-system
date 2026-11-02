require("dotenv").config();

const mongoose = require("mongoose");
const { Employee } = require("../src/models/Employee");

const seedEmployees = [
  {
    name: "Zynvixs Admin",
    email: process.env.ADMIN_EMAIL || "admin@zynvixs.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    role: "admin",
    phone: "9876543210",
    department: "HR",
    designation: "HR Manager",
    salary: 90000,
    status: "active",
    address: "Mumbai",
  },
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@zynvixs.com",
    password: "Employee@123",
    role: "employee",
    phone: "9876500001",
    department: "Engineering",
    designation: "Backend Developer",
    salary: 65000,
    status: "active",
    address: "Pune",
  },
  {
    name: "Diya Patel",
    email: "diya.patel@zynvixs.com",
    password: "Employee@123",
    role: "employee",
    phone: "9876500002",
    department: "Finance",
    designation: "Accountant",
    salary: 52000,
    status: "active",
    address: "Ahmedabad",
  },
  {
    name: "Rohan Gupta",
    email: "rohan.gupta@zynvixs.com",
    password: "Employee@123",
    role: "employee",
    phone: "9876500003",
    department: "Sales",
    designation: "Sales Executive",
    salary: 48000,
    status: "inactive",
    address: "Delhi",
  },
  {
    name: "Meera Iyer",
    email: "meera.iyer@zynvixs.com",
    password: "Employee@123",
    role: "employee",
    phone: "9876500004",
    department: "Operations",
    designation: "Operations Lead",
    salary: 70000,
    status: "active",
    address: "Bengaluru",
  },
];

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Employee.deleteMany({});
  await Employee.create(seedEmployees);
  console.log("Seed complete. Admin login:");
  console.log(`  email: ${seedEmployees[0].email}`);
  console.log(`  password: ${seedEmployees[0].password}`);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
