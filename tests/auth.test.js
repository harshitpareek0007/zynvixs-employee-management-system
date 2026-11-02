const request = require("supertest");
const app = require("../src/app");

const sampleEmployee = {
  name: "Test User",
  email: "test.user@zynvixs.com",
  password: "Password@123",
  department: "Engineering",
  designation: "Intern",
};

describe("Health and auth", () => {
  it("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("registers an employee and forces role to employee", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...sampleEmployee, role: "admin" });

    expect(res.status).toBe(201);
    expect(res.body.data.employee.role).toBe("employee");
    expect(res.body.data.employee.password).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
  });

  it("rejects duplicate registration", async () => {
    await request(app).post("/api/auth/register").send(sampleEmployee);
    const res = await request(app).post("/api/auth/register").send(sampleEmployee);
    expect(res.status).toBe(409);
  });

  it("logs in with valid credentials", async () => {
    await request(app).post("/api/auth/register").send(sampleEmployee);
    const res = await request(app).post("/api/auth/login").send({
      email: sampleEmployee.email,
      password: sampleEmployee.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("rejects invalid login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@zynvixs.com",
      password: "wrongpass",
    });
    expect(res.status).toBe(401);
  });

  it("rejects /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current profile with a valid token", async () => {
    const registered = await request(app).post("/api/auth/register").send(sampleEmployee);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registered.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(sampleEmployee.email);
  });
});

describe("validation", () => {
  it("returns 400 for invalid register payload", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "short",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
