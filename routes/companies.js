// routes/companies.js
import express from "express";
import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getAllCompanyInvoices,
  getCompany,
  updateCompany,
} from "../db.js"; // Ensure the path to db.js is correct

const router = express.Router();

/**
 * GET /companies
 * Returns list of companies, like `{companies: [{code, name}, ...]}`
 */
router.get("/", async (req, res, next) => {
  try {
    const companies = await getAllCompanies();
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /companies/:code
 * Returns obj of company:
 * `{company: {code, name, description,invoices: [id, ...]}}`
 */
router.get("/:code", async (req, res, next) => {
  try {
    const company = await getCompany(req.params.code);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    const invoices = await getAllCompanyInvoices(req.params.code);
    company.invoices = invoices.map((inv) => inv.id);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /companies
 * Adds a company. Needs to be given JSON like: `{code, name, description}`
 * Returns obj of new company: `{company: {code, name, description}}`
 */
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const company = await createCompany(code, name, description);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /companies/:code
 * Edit existing company. Should return 404 if company cannot be found.
 * Needs to be given JSON like: `{name, description}`
 * Returns updated company object: `{company: {code, name, description}}`
 */
router.put("/:code", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const company = await updateCompany(req.params.code, name, description);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /companies/:code
 * Deletes company. Should return 404 if company cannot be found.
 * Returns `{status: "deleted"}`
 */
router.delete("/:code", async (req, res, next) => {
  try {
    const company = await deleteCompany(req.params.code);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

export default router;
