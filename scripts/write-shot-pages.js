const fs = require("fs");
const path = require("path");

const shots = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "screenshots", "api-responses.json"), "utf8")
);

const wanted = {
  "POST /api/employees": "01-create",
  "GET /api/employees": "02-list",
  "PUT /api/employees/:id": "03-update",
  "DELETE /api/employees/:id": "04-delete",
  "POST /api/employees — validation 400": "05-validation-400",
  "GET /api/employees — 401 unauthorized": "06-unauthorized-401",
};

const outDir = path.join(__dirname, "..", "screenshots", "pages");
fs.mkdirSync(outDir, { recursive: true });

const page = (shot) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${shot.title}</title>
  <style>
    body { font-family: Segoe UI, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 32px; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    .sub { color: #94a3b8; margin-bottom: 20px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .ok { color: #4ade80; }
    .err { color: #f87171; }
    pre { background: #020617; padding: 16px; border-radius: 8px; overflow: auto; font-size: 14px; line-height: 1.5; }
  </style>
</head>
<body>
  <h1>Employee Management System</h1>
  <p class="sub">Zynvixs intern assignment — API screenshot</p>
  <div class="card">
    <h2>${shot.title} <span class="${shot.status < 400 ? "ok" : "err"}">HTTP ${shot.status}</span></h2>
    <pre>${JSON.stringify(shot.body, null, 2)}</pre>
  </div>
</body>
</html>`;

Object.entries(wanted).forEach(([title, name]) => {
  const shot = shots.find((item) => item.title === title);
  if (!shot) {
    throw new Error(`Missing shot: ${title}`);
  }
  fs.writeFileSync(path.join(outDir, `${name}.html`), page(shot));
});

console.log("Wrote screenshot pages");
