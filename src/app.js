const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Management System API is running",
    data: { uptime: process.uptime() },
  });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
    errors: [],
  },
});

if (process.env.NODE_ENV === "test") {
  app.use("/api/auth", authRoutes);
} else {
  app.use("/api/auth", authLimiter, authRoutes);
}
app.use("/api/employees", employeeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
