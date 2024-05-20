// app.js
import express from "express";
import morgan from "morgan";
import ExpressError from "./expressError.js";
import dbClient from "./middleware/dbClient.js";
import companiesRoutes from "./routes/companies.js";
import invoicesRoutes from "./routes/invoices.js";

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Route logging middleware
app.use(morgan("dev"));

// Database middleware
app.use(dbClient);

// Company routes
app.use("/companies", companiesRoutes);

// Invoice routes
app.use("/invoices", invoicesRoutes);

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
