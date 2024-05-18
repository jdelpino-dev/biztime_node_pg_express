// app.js
import express from "express";
import morgan from "morgan";
import ExpressError from "./expressError.js";
import companiesRoutes from "./routes/companies.js";

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use(morgan("dev"));

// Company routes
app.use("/companies", companiesRoutes);

// 404 handler
app.use(function (req, res, next) {
  return next(new ExpressError("Not Found", 404));
});

// Generic error handler
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  return res.status(status).json({
    error: {
      message: err.message,
      status: status,
    },
  });
});

export default app;
