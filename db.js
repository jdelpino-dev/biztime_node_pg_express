/**
 * Database setup for BizTime.
 * This module provides various functions to interact with the 'companies'
 * and 'invoices' tables. It includes functions for CRUD operations
 * and other database interactions.
 *
 * @module db
 */

import pg from "pg";
const { Client } = pg;

/**
 * Initializes the PostgreSQL client and connects to the database.
 * Listens for errors on the client.
 */
const client = new Client({
  connectionString: "postgresql:///biztime",
});

client.connect();

client.on("error", (err) => {
  console.error("Database connection error:", err.stack);
});

/**
 * Fetches all companies from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of companies.
 */
async function getAllCompanies() {
  try {
    const res = await client.query("SELECT * FROM companies");
    return res.rows;
  } catch (err) {
    console.error("Error getting companies:", err);
    throw err;
  }
}

/**
 * Fetches a company by its code.
 * @param {string} code - The code of the company.
 * @returns {Promise<Object>} A promise that resolves to the company object.
 */
async function getCompany(code) {
  try {
    const res = await client.query("SELECT * FROM companies WHERE code = $1", [
      code,
    ]);
    return res.rows[0];
  } catch (err) {
    console.error("Error getting company:", err);
    throw err;
  }
}

/**
 * Creates a new company in the database.
 * @param {string} code - The code of the company.
 * @param {string} name - The name of the company.
 * @param {string} description - The description of the company.
 * @returns {Promise<Object>} A promise that resolves to the newly created company object.
 */
async function createCompany(code, name, description) {
  try {
    const res = await client.query(
      "INSERT INTO companies (code, name, description)" +
        "VALUES ($1, $2, $3) RETURNING *",
      [code, name, description]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error creating company:", err);
    throw err;
  }
}

/**
 * Updates an existing company in the database.
 * @param {string} code - The code of the company to update.
 * @param {string} name - The new name of the company.
 * @param {string} description - The new description of the company.
 * @returns {Promise<Object>} A promise that resolves to the updated company object.
 */
async function updateCompany(code, name, description) {
  try {
    const res = await client.query(
      "UPDATE companies SET name = $1, description = $2" +
        "WHERE code = $3 RETURNING *",
      [name, description, code]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error updating company:", err);
    throw err;
  }
}

/**
 * Deletes a company from the database.
 * @param {string} code - The code of the company to delete.
 * @returns {Promise<Object>} A promise that resolves to the deleted company object.
 */
async function deleteCompany(code) {
  try {
    const res = await client.query(
      "DELETE FROM companies WHERE code = $1 RETURNING *",
      [code]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error deleting company:", err);
    throw err;
  }
}

/**
 * Fetches all invoices from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of invoices.
 */
async function getAllInvoices() {
  try {
    const res = await client.query("SELECT * FROM invoices");
    return res.rows;
  } catch (err) {
    console.error("Error getting invoices:", err);
    throw err;
  }
}

/**
 * Fetches an invoice by its ID.
 * @param {number} id - The ID of the invoice.
 * @returns {Promise<Object>} A promise that resolves to the invoice object.
 */
async function getInvoice(id) {
  try {
    const res = await client.query("SELECT * FROM invoices WHERE id = $1", [
      id,
    ]);
    return res.rows[0];
  } catch (err) {
    console.error("Error getting invoice:", err);
    throw err;
  }
}

/**
 * Creates a new invoice in the database.
 * @param {string} comp_code - The code of the company for the invoice.
 * @param {number} amt - The amount of the invoice.
 * @param {boolean} paid - The paid status of the invoice.
 * @param {Date} paid_date - The paid date of the invoice.
 * @returns {Promise<Object>} A promise that resolves to the newly created invoice object.
 */
async function createInvoice(comp_code, amt, paid = false, paid_date) {
  try {
    const res = await client.query(
      "INSERT INTO invoices (comp_code, amt, paid, paid_date)" +
        " VALUES ($1, $2, $3, $4) RETURNING *",
      [comp_code, amt, paid, paid_date]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error creating invoice:", err);
    throw err;
  }
}

/**
 * Updates an existing invoice in the database.
 * Only updates the fields provided in the parameters.
 * @param {number} id - The ID of the invoice to update.
 * @param {Object} fields - An object containing the fields to update.
 * @returns {Promise<Object>} A promise that resolves to the updated invoice object.
 */
async function updateInvoice(id, fields) {
  try {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    // Build the SET clauses dynamically based on the provided fields
    for (const field in fields) {
      setClauses.push(`${field} = $${paramIndex}`);
      values.push(fields[field]);
      paramIndex++;
    }

    values.push(id); // Add the id to the end of the values array

    const query = `
      UPDATE invoices
      SET ${setClauses.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const res = await client.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error updating invoice:", err);
    throw err;
  }
}

/**
 * Updates the amount field of existing invoice in the database.
 * @param {number} id - The ID of the invoice to update.
 * @param {number} amt - The new amount of the invoice.
 * @returns {Promise<Object>} A promise that resolves to the updated invoice object.
 */
async function updateInvoiceAmt(id, amt) {
  try {
    const res = await client.query(
      "UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING *",
      [amt, id]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error updating invoice amount:", err);
    throw err;
  }
}

/**
 * Deletes an invoice from the database.
 * @param {number} id - The ID of the invoice to delete.
 * @returns {Promise<Object>} A promise that resolves to the deleted invoice object.
 */
async function deleteInvoice(id) {
  try {
    const res = await client.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING *",
      [id]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error deleting invoice:", err);
    throw err;
  }
}

/**
 * Fetches all invoices for a specific company from the database.
 * @param {string} code - The code of the company.
 * @returns {Promise<Array>} A promise that resolves to an array of invoices for the company.
 */
async function getAllCompanyInvoices(code) {
  try {
    const res = await client.query(
      "SELECT * FROM invoices WHERE comp_code = $1",
      [code]
    );
    return res.rows;
  } catch (err) {
    console.error("Error getting company invoices:", err);
    throw err;
  }
}

/**
 * Fetches the total number of invoices in the database.
 * @returns {Promise<number>} A promise that resolves to the total number of invoices.
 */
async function getInvoiceCount() {
  let res = await client.query("SELECT COUNT(*) FROM invoices");
  let count = parseInt(res.rows[0].count, 10);
  console.log("Total Invoices:", count);
  return count;
}

/**
 * Fetches unpaid invoices from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of unpaid invoices.
 */
async function getUnpaidInvoices() {
  let res = await client.query("SELECT * FROM invoices WHERE paid = false");
  let unpaidInvoices = res.rows;
  console.log("Unpaid Invoices:", unpaidInvoices);
  return unpaidInvoices;
}

/**
 * Fetches paid invoices from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of paid invoices.
 */
async function getPaidInvoices() {
  let res = await client.query("SELECT * FROM invoices WHERE paid = true");
  let paidInvoices = res.rows;
  console.log("Paid Invoices:", paidInvoices);
  return paidInvoices;
}

/**
 * Fetches all companies along with their associated invoices.
 * @returns {Promise<Array>} A promise that resolves to an array of companies with their invoices.
 */
async function getAllCompaniesWithInvoices() {
  let res = await client.query(`
    SELECT c.code, c.name, c.description, i.id, i.amt, i.paid, i.add_date, i.paid_date
    FROM companies AS c
    LEFT JOIN invoices AS i
    ON c.code = i.comp_code
  `);
  let companiesWithInvoices = res.rows;
  console.log("Companies with Invoices:", companiesWithInvoices);
  return companiesWithInvoices;
}

/**
 * Fetches the latest invoice added to the database.
 * @returns {Promise<Object>} A promise that resolves to the latest invoice object.
 */
async function getLatestInvoice() {
  let res = await client.query(
    "SELECT * FROM invoices ORDER BY add_date DESC LIMIT 1"
  );
  let latestInvoice = res.rows[0];
  console.log("Latest Invoice:", latestInvoice);
  return latestInvoice;
}

/**
 * Fetches invoices within a specific date range.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @returns {Promise<Array>} A promise that resolves to an array of invoices within the date range.
 */
async function getInvoicesByDateRange(startDate, endDate) {
  let res = await client.query(
    "SELECT * FROM invoices WHERE add_date BETWEEN $1 AND $2",
    [startDate, endDate]
  );
  let invoicesByDateRange = res.rows;
  console.log("Invoices by Date Range:", invoicesByDateRange);
  return invoicesByDateRange;
}

/**
 * Fetches a company along with all its invoices.
 * @param {string} code - The company code.
 * @returns {Promise<Object>} A promise that resolves to a company object with its invoices.
 */
async function getCompanyWithInvoices(code) {
  let res = await client.query(
    `SELECT c.code, c.name, c.description, i.id, i.amt, i.paid, i.add_date, i.paid_date
     FROM companies AS c
     LEFT JOIN invoices AS i
     ON c.code = i.comp_code
     WHERE c.code = $1`,
    [code]
  );
  let companyWithInvoices = res.rows;
  console.log("Company with Invoices:", companyWithInvoices);
  return companyWithInvoices;
}

/**
 * Fetches invoices that are due (unpaid and past the paid date).
 * @returns {Promise<Array>} A promise that resolves to an array of due invoices.
 */
async function getDueInvoices() {
  let res = await client.query(
    "SELECT * FROM invoices WHERE paid = false AND paid_date < CURRENT_DATE"
  );
  let dueInvoices = res.rows;
  console.log("Due Invoices:", dueInvoices);
  return dueInvoices;
}

/**
 * Updates the paid status and paid date of an invoice.
 * @param {number} id - The ID of the invoice.
 * @param {boolean} paid - The new paid status.
 * @param {Date} [paidDate] - The new paid date (optional).
 * @returns {Promise<Object>} A promise that resolves to the updated invoice object.
 */
async function updateInvoicePaidStatus(id, paid, paidDate = null) {
  let query = `
    UPDATE invoices
    SET paid = $1, paid_date = $2
    WHERE id = $3
    RETURNING *`;
  let res = await client.query(query, [paid, paidDate, id]);
  let updatedInvoice = res.rows[0];
  console.log("Updated Invoice:", updatedInvoice);
  return updatedInvoice;
}

process.on("exit", () => {
  client.end();
});

export {
  createCompany,
  createInvoice,
  deleteCompany,
  deleteInvoice,
  getAllCompanies,
  getAllCompaniesWithInvoices,
  getAllCompanyInvoices,
  getAllInvoices,
  getCompany,
  getCompanyWithInvoices,
  getDueInvoices,
  getInvoice,
  getInvoiceCount,
  getInvoicesByDateRange,
  getLatestInvoice,
  getPaidInvoices,
  getUnpaidInvoices,
  updateCompany,
  updateInvoice,
  updateInvoiceAmt,
  updateInvoicePaidStatus,
};
