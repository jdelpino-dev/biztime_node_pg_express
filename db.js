/**
 * Database setup for BizTime.
 * This module provides various functions to interact with the 'companies'
 * and 'invoices' tables. It includes functions for CRUD operations
 * and other database interactions.
 *
 * @module db
 */

import pkg from "pg";
import { getCalendarDate } from "./utils/dateTime.js";

const { Pool } = pkg;

/**
 * Initializes the PostgreSQL client and connects to the database.
 * Listens for errors on the client.
 */

// Set the database URL/connection-string based on the environment
let databaseUrl;
if (process.env.NODE_ENV === "test") {
  databaseUrl = "postgresql:///biztime-test";
} else {
  databaseUrl = "postgresql:///biztime";
}

const pool = new Pool({
  connectionString: databaseUrl,
});

// Set the timezone to UTC
pool.on("connect", async () => {
  await pool.query("SET TIME ZONE 'UTC'");
});

// Listen for errors on the pool/cleint
pool.on("error", (err) => {
  console.error("Database connection error:", err.stack);
});

/**
 * Begins a database transaction by acquiring a client connection
 * from the pool and starting a transaction.
 * @returns {Promise<import('pg').Client>}
 */
async function beginTransactions() {
  const client = await pool.connect();
  await client.query("BEGIN");
  return client;
}

/**
 * Commits the current transaction and releases the client.
 * @param {import('pg').Client} client - The client connection.
 * @returns {Promise<void>}
 */
async function commitTransactions(client) {
  await client.query("COMMIT");
}

/**
 * Rolls back the current transaction and releases the client.
 * @param {import('pg').Client} client - The client connection.
 * @returns {Promise<void>}
 */
async function rollbackTransactions(client) {
  await client.query("ROLLBACK");
}

/**
 * Fetches all companies from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of companies.
 */
async function getAllCompanies(client = null) {
  try {
    let res;
    if (!client) {
      res = await pool.query("SELECT * FROM companies");
    } else {
      res = await client.query("SELECT * FROM companies");
    }
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
async function getCompany(code, client = null) {
  try {
    if (!code) throw new Error("Company code is required.");

    let res;
    if (!client) {
      res = await pool.query("SELECT * FROM companies WHERE code = $1", [
        code,
      ]);
    } else {
      res = await client.query("SELECT * FROM companies WHERE code = $1", [
        code,
      ]);
    }
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
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the newly created company object.
 */
async function createCompany(code, name, description = null, client = null) {
  try {
    if (!code || !name) throw new Error("Company code and name are required.");
    if (!client) throw new Error("Client is required.");

    const res = await client.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
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
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the updated company object.
 */
async function updateCompany(code, name, description, client = null) {
  try {
    if (!client) throw new Error("Client is required.");

    const res = await client.query(
      "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *",
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
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the deleted company object.
 */
async function deleteCompany(code, client = null) {
  try {
    if (!client) throw new Error("Client is required.");
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
async function getAllInvoices(client = null) {
  try {
    let res;
    if (!client) {
      res = await pool.query("SELECT * FROM invoices");
    } else {
      res = await client.query("SELECT * FROM invoices");
    }
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
async function getInvoice(id, client = null) {
  try {
    if (!id) throw new Error("Invoice ID is required.");
    let res;
    if (!client) {
      res = await pool.query("SELECT * FROM invoices WHERE id = $1", [id]);
    } else {
      res = await client.query("SELECT * FROM invoices WHERE id = $1", [id]);
    }
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
 * @param {Date} add_date - The added date of the invoice.
 * @param {Date} paid_date - The paid date of the invoice.
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the newly created invoice object.
 */
async function createInvoice(
  comp_code,
  amt,
  paid = false,
  add_date = getCalendarDate(Date.now()),
  paid_date = null,
  client = null
) {
  try {
    if (!client) throw new Error("Client is required.");
    const res = await client.query(
      "INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        comp_code,
        amt,
        paid,
        add_date ? getCalendarDate(add_date) : add_date,
        paid_date ? getCalendarDate(paid_date) : paid_date,
      ]
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
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the updated invoice object.
 */
async function updateInvoice(id, fields, client = null) {
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

  try {
    if (!client) throw new Error("Client is required.");
    const res = await client.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error updating invoice:", err);
    throw err;
  }
}

/**
 * Updates the amount field of an existing invoice in the database.
 * @param {number} id - The ID of the invoice to update.
 * @param {number} amt - The new amount of the invoice.
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the updated invoice object.
 */
async function updateInvoiceAmt(id, amt, client = null) {
  try {
    if (!client) throw new Error("Client is required.");
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
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the deleted invoice object.
 */
async function deleteInvoice(id, client = null) {
  try {
    if (!client) throw new Error("Client is required.");
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
async function getAllCompanyInvoices(code, client = null) {
  try {
    const query = "SELECT * FROM invoices WHERE comp_code = $1";
    let res;
    if (!client) {
      res = await pool.query(query, [code]);
    } else {
      res = await client.query(query, [code]);
    }
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
async function getInvoiceCount(client = null) {
  try {
    const query = "SELECT COUNT(*) FROM invoices";
    let res;
    if (!client) {
      res = await pool.query(query);
    } else {
      res = await client.query(query);
    }
    let count = parseInt(res.rows[0].count, 10);
    return count;
  } catch (err) {
    console.error("Error getting invoice count:", err);
    throw err;
  }
}

/**
 * Fetches unpaid invoices from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of unpaid invoices.
 */
async function getUnpaidInvoices(client = null) {
  try {
    const query = "SELECT * FROM invoices WHERE paid = false";
    let res;
    if (!client) {
      res = await pool.query(query);
    } else {
      res = await client.query(query);
    }
    let unpaidInvoices = res.rows;
    return unpaidInvoices;
  } catch (err) {
    console.error("Error getting unpaid invoices:", err);
    throw err;
  }
}

/**
 * Fetches paid invoices from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of paid invoices.
 */
async function getPaidInvoices(client = null) {
  try {
    const query = "SELECT * FROM invoices WHERE paid = true";
    let res;
    if (!client) {
      res = await pool.query(query);
    } else {
      res = await client.query(query);
    }
    let paidInvoices = res.rows;
    return paidInvoices;
  } catch (err) {
    console.error("Error getting paid invoices:", err);
    throw err;
  }
}

/**
 * Fetches all companies along with their associated invoices.
 * @returns {Promise<Array>} A promise that resolves to an array of companies with their invoices.
 */
async function getAllCompaniesWithInvoices(client = null) {
  const query = `
    SELECT c.code, c.name, c.description, i.id, i.amt, i.paid, i.add_date, i.paid_date
    FROM companies AS c
    LEFT JOIN invoices AS i
    ON c.code = i.comp_code
  `;
  let res;
  if (!client) {
    res = await pool.query(query);
  } else {
    res = await client.query(query);
  }
  let companiesWithInvoices = res.rows;
  return companiesWithInvoices;
}

/**
 * Fetches the latest invoice added to the database.
 * @returns {Promise<Object>} A promise that resolves to the latest invoice object.
 */
async function getLatestInvoice(client = null) {
  try {
    const query = `
    SELECT * FROM invoices
    ORDER BY add_date DESC, id DESC LIMIT 1
      `;
    let res;
    if (!client) {
      res = await pool.query(query);
    } else {
      res = await client.query(query);
    }
    let latestInvoice = res.rows[0];
    return latestInvoice;
  } catch (err) {
    console.error("Error getting latest invoice:", err);
    throw err;
  }
}

/**
 * Fetches invoices within a specific date range.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @returns {Promise<Array>} A promise that resolves to an array of invoices within the date range.
 */
async function getInvoicesByDateRange(startDate, endDate, client = null) {
  try {
    const query = "SELECT * FROM invoices WHERE add_date BETWEEN $1 AND $2";
    let res;
    const queryArgs = [
      startDate ? getCalendarDate(startDate) : startDate,
      endDate ? getCalendarDate(endDate) : endDate,
    ];
    if (!client) {
      res = await pool.query(query, queryArgs);
    } else {
      res = await client.query(query, queryArgs);
    }
    let invoicesByDateRange = res.rows;
    return invoicesByDateRange;
  } catch (err) {
    console.error("Error getting invoices by date range:", err);
    throw err;
  }
}

/**
 * Fetches a company along with all its invoices.
 * @param {string} code - The company code.
 * @returns {Promise<Object>} A promise that resolves to a company object with its invoices.
 */
async function getCompanyWithInvoices(code, client = null) {
  try {
    const query = `
      SELECT c.code, c.name, c.description, i.id, i.amt, i.paid, i.add_date, i.paid_date
      FROM companies AS c
      LEFT JOIN invoices AS i
      ON c.code = i.comp_code
      WHERE c.code = $1`;
    let res;
    if (!client) {
      res = await pool.query(query, [code]);
    } else {
      res = await client.query(query, [code]);
    }
    let companyWithInvoices = res.rows;
    return companyWithInvoices;
  } catch (err) {
    console.error("Error getting company with invoices:", err);
    throw err;
  }
}

/**
 * Fetches invoices that are due (unpaid and past the paid date).
 * @returns {Promise<Array>} A promise that resolves to an array of due invoices.
 */
async function getDueInvoices(client = null) {
  try {
    let res;
    if (!client) {
      res = await pool.query(
        "SELECT * FROM invoices WHERE paid = false AND paid_date < CURRENT_DATE"
      );
    } else {
      res = await client.query(
        "SELECT * FROM invoices WHERE paid = false AND paid_date < CURRENT_DATE"
      );
    }
    let dueInvoices = res.rows;
    return dueInvoices;
  } catch (err) {
    console.error("Error getting due invoices:", err);
    throw err;
  }
}

/**
 * Updates the paid status and paid date of an invoice.
 * @param {number} id - The ID of the invoice.
 * @param {boolean} paid - The new paid status.
 * @param {Date} [paidDate] - The new paid date (optional).
 * @param {import('pg').Client} [client] - Optional client for transaction management.
 * @returns {Promise<Object>} A promise that resolves to the updated invoice object.
 */
async function updateInvoicePaidStatus(
  id,
  paid,
  paidDate = null,
  client = null
) {
  try {
    if (!client) throw new Error("Client is required.");
    // if (paid && !paidDate) paidDate = new Date();
    const query = `
      UPDATE invoices
      SET paid = $1, paid_date = $2
      WHERE id = $3
      RETURNING *`;
    const res = await client.query(query, [
      paid,
      paidDate ? getCalendarDate(paidDate) : paidDate,
      id,
    ]);
    let updatedInvoice = res.rows[0];
    return updatedInvoice;
  } catch (err) {
    console.error("Error updating invoice:", err);
    throw err;
  }
}

export {
  beginTransactions,
  commitTransactions,
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
  pool,
  rollbackTransactions,
  updateCompany,
  updateInvoice,
  updateInvoiceAmt,
  updateInvoicePaidStatus,
};
