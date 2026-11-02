const request = require("supertest");
const app = require("../src/app");
const { Employee } = require("../src/models/Employee");

const adminPayload = {
  name: "Admin User",
  email: "admin@zynvixs.com",
  password: "Admin@123",
  role: "admin",
  department: "HR",
  designation: "HR Manager",
  salary: 90000,
};

const employeePayload = {
  name: "Riya Singh",
  email: "riya.singh@zynvixs.com",
  password: "Employee@123",
  department: "Engineering",
  designation: "Developer",
  salary: 60000,
};

const login = async (email, password) => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.data.token;
};

describe("Employee CRUD", () => {
  let adminToken;
  let employeeToken;
  let employeeId;

  beforeEach(async () => {
    await Employee.create(adminPayload);
    const employee = await Employee.create(employeePayload);
    employeeId = employee._id.toString();
    adminToken = await login(adminPayload.email, adminPayload.password);
    employeeToken = await login(employeePayload.email, employeePayload.password);
  });

  it("lets admin create an employee", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Karan Mehta",
        email: "karan.mehta@zynvixs.com",
        password: "Employee@123",
        department: "Sales",
        designation: "Executive",
        salary: 45000,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("karan.mehta@zynvixs.com");
    expect(res.body.data.password).toBeUndefined();
  });

  it("rejects duplicate email with 409", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(employeePayload);

    expect(res.status).toBe(409);
  });

  it("rejects invalid create payload with 400", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "X", email: "bad" });

    expect(res.status).toBe(400);
  });

  it("lists employees with pagination", async () => {
    const res = await request(app)
      .get("/api/employees?page=1&limit=1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it("filters employees by department", async () => {
    const res = await request(app)
      .get("/api/employees?department=Engineering")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.every((item) => item.department === "Engineering")).toBe(true);
  });

  it("lets admin update an employee", async () => {
    const res = await request(app)
      .put(`/api/employees/${employeeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ designation: "Senior Developer", salary: 75000 });

    expect(res.status).toBe(200);
    expect(res.body.data.designation).toBe("Senior Developer");
    expect(res.body.data.salary).toBe(75000);
  });

  it("lets an employee read their own record", async () => {
    const res = await request(app)
      .get(`/api/employees/${employeeId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(employeePayload.email);
  });

  it("blocks an employee from creating employees", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        name: "New Hire",
        email: "new.hire@zynvixs.com",
        password: "Employee@123",
        department: "HR",
        designation: "Recruiter",
      });

    expect(res.status).toBe(403);
  });

  it("blocks an employee from reading another employee", async () => {
    const admin = await Employee.findOne({ email: adminPayload.email });
    const res = await request(app)
      .get(`/api/employees/${admin._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid ObjectId", async () => {
    const res = await request(app)
      .get("/api/employees/not-a-valid-id")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it("blocks an employee from deleting another employee", async () => {
    const res = await request(app)
      .delete(`/api/employees/${employeeId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });

  it("lets admin delete an employee", async () => {
    const res = await request(app)
      .delete(`/api/employees/${employeeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const check = await Employee.findById(employeeId);
    expect(check).toBeNull();
  });

  it("returns 404 for missing employee", async () => {
    const res = await request(app)
      .get("/api/employees/64b5f2c0c5e4b2a1d3c9e111")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
