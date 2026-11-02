require("dotenv").config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "demo-secret";
process.env.JWT_EXPIRES_IN = "1d";
process.env.NODE_ENV = "development";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const { Employee } = require("../src/models/Employee");

const PORT = process.env.PORT || 5000;

const start = async () => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  await Employee.create([
    {
      name: "Zynvixs Admin",
      email: "admin@zynvixs.com",
      password: "Admin@123",
      role: "admin",
      department: "HR",
      designation: "HR Manager",
      salary: 90000,
      phone: "9876543210",
    },
    {
      name: "Aarav Sharma",
      email: "aarav.sharma@zynvixs.com",
      password: "Employee@123",
      role: "employee",
      department: "Engineering",
      designation: "Backend Developer",
      salary: 65000,
    },
  ]);

  app.listen(PORT, () => {
    console.log(`Demo API running at http://localhost:${PORT}`);
    console.log("In-memory MongoDB is seeded with admin@zynvixs.com / Admin@123");
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
