/** BizTime express application. */
import express from "express";
import ExpressError from "./expressError";

const app = express();

app.use(express.json());

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message,
  });
});

export default app;
