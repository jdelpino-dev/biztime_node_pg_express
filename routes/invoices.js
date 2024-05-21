// routes/invoices.js
import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoice,
  updateInvoice,
} from "../db.js";
import ExpressError from "../expressError.js";

const router = express.Router();

/**
 * GET /invoices
 * Return info on invoices: `{invoices: [{id, comp_code}, ...]}`
 */
router.get("/", async (req, res, next) => {
  try {
    const invoices = await getAllInvoices(req.dbClient);
    return res.json({ invoices });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /invoices/:id
 * Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns `{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}`
 */
router.get("/:id", async (req, res, next) => {
  try {
    const invoice = await getInvoice(req.params.id, req.dbClient);
    if (!invoice) {
      const error = new ExpressError("Invoice not found", 404);
      throw error;
    }
    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /invoices
 * Adds an invoice. Needs to be passed in JSON body of: `{comp_code, amt}`
 * Returns `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`
 */
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const invoice = await createInvoice(
      comp_code,
      amt,
      undefined,
      undefined,
      undefined,
      req.dbClient
    );
    return res.status(201).json({ invoice });
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /invoices/:id
 * Updates an invoice. If invoice cannot be found, returns a 404.
 * Allows partial updates by only updating fields provided in the request body.
 * Returns `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`
 */
router.put("/:id", async (req, res, next) => {
  try {
    const invoiceId = req.params.id;
    const fields = req.body;

    // Check if the fields object is empty
    if (Object.keys(fields).length === 0) {
      const error = new ExpressError("No fields to update provided", 400);
      throw error;
    }

    const invoice = await updateInvoice(invoiceId, fields, req.dbClient);

    if (!invoice) {
      const error = new ExpressError("Invoice not found", 404);
      throw error;
    }

    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /invoices/:id
 * Deletes an invoice. If invoice cannot be found, returns a 404.
 * Returns `{status: "deleted"}`
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const invoice = await deleteInvoice(req.params.id, req.dbClient);
    if (!invoice) {
      const error = new ExpressError("Invoice not found", 404);
      throw error;
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

export default router;
