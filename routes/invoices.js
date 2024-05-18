// routes/invoices.js
import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoice,
  updateInvoiceAmt,
} from "../db.js"; // Ensure the path to db.js is correct

const router = express.Router();

/**
 * GET /invoices
 * Return info on invoices: `{invoices: [{id, comp_code}, ...]}`
 */
router.get("/", async (req, res, next) => {
  try {
    const invoices = await getAllInvoices();
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
    const invoice = await getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
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
    const invoice = await createInvoice(comp_code, amt);
    return res.status(201).json({ invoice });
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /invoices/:id
 * Updates an invoice. If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of `{amt}`
 * Returns `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { amt } = req.body;
    const invoice = await updateInvoiceAmt(req.params.id, amt);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
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
    const invoice = await deleteInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

export default router;
