process.env.JWT_SECRET = "demo-secret";
process.env.JWT_EXPIRES_IN = "1d";
process.env.NODE_ENV = "test";

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../src/app");
const { Employee } = require("../src/models/Employee");

const redactToken = (body) => {
  const clone = JSON.parse(JSON.stringify(body));
  if (clone.data && clone.data.token) {
    clone.data.token = clone.data.token.slice(0, 24) + "...";
  }
  return clone;
};

const run = async () => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  await Employee.create({
    name: "Zynvixs Admin",
    email: "admin@zynvixs.com",
    password: "Admin@123",
    role: "admin",
    department: "HR",
    designation: "HR Manager",
    salary: 90000,
  });

  const shots = [];

  const health = await request(app).get("/health");
  shots.push({ title: "GET /health", status: health.status, body: health.body });

  const login = await request(app).post("/api/auth/login").send({
    email: "admin@zynvixs.com",
    password: "Admin@123",
  });
  shots.push({ title: "POST /api/auth/login", status: login.status, body: redactToken(login.body) });
  const token = login.body.data.token;

  const created = await request(app)
    .post("/api/employees")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Ishaan Verma",
      email: "ishaan.verma@zynvixs.com",
      password: "Employee@123",
      department: "Engineering",
      designation: "Frontend Developer",
      salary: 58000,
    });
  shots.push({ title: "POST /api/employees", status: created.status, body: created.body });
  const id = created.body.data._id;

  const list = await request(app)
    .get("/api/employees?page=1&limit=10&department=Engineering")
    .set("Authorization", `Bearer ${token}`);
  shots.push({ title: "GET /api/employees", status: list.status, body: list.body });

  const updated = await request(app)
    .put(`/api/employees/${id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ designation: "Senior Frontend Developer", salary: 72000 });
  shots.push({ title: "PUT /api/employees/:id", status: updated.status, body: updated.body });

  const bad = await request(app)
    .post("/api/employees")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "X", email: "bad" });
  shots.push({ title: "POST /api/employees — validation 400", status: bad.status, body: bad.body });

  const unauth = await request(app).get("/api/employees");
  shots.push({ title: "GET /api/employees — 401 unauthorized", status: unauth.status, body: unauth.body });

  const deleted = await request(app)
    .delete(`/api/employees/${id}`)
    .set("Authorization", `Bearer ${token}`);
  shots.push({ title: "DELETE /api/employees/:id", status: deleted.status, body: deleted.body });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>EMS API Screenshots</title>
  <style>
    body { font-family: Segoe UI, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 32px; }
    h1 { margin: 0 0 8px; }
    .sub { color: #94a3b8; margin-bottom: 24px; }
    .card { background: #1e293b; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; border: 1px solid #334155; }
    .ok { color: #4ade80; }
    .err { color: #f87171; }
    pre { background: #020617; padding: 14px; border-radius: 8px; overflow: auto; font-size: 13px; line-height: 1.45; }
    h2 { font-size: 16px; margin: 0 0 10px; }
  </style>
</head>
<body>
  <h1>Employee Management System — API responses</h1>
  <p class="sub">Node.js / Express / MongoDB &nbsp;|&nbsp; Zynvixs intern assignment</p>
  ${shots
    .map((shot) => {
      const klass = shot.status < 400 ? "ok" : "err";
      return `<div class="card"><h2>${shot.title} <span class="${klass}">HTTP ${shot.status}</span></h2><pre>${JSON.stringify(shot.body, null, 2)}</pre></div>`;
    })
    .join("\n")}
</body>
</html>`;

  const outDir = path.join(__dirname, "..", "screenshots");
  fs.writeFileSync(path.join(outDir, "api-responses.html"), html);
  fs.writeFileSync(path.join(outDir, "api-responses.json"), JSON.stringify(shots, null, 2));

  await mongoose.disconnect();
  await mongo.stop();
  console.log("Wrote screenshots/api-responses.html");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
