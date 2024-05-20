/**
 * Mock tests for the Database Functions for BizTime.
 * @module db
 */

import { Pool } from "pg";
import {
  beginTransactionsDB,
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
  rollbackTransactionsDB,
  updateCompany,
  updateInvoice,
  updateInvoicePaidStatus,
} from "../db";

// Mock the pg module and initialise a new instance of the mocked pool
jest.mock("pg", () => {
  const mPool = {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
    on: jest.fn(),
    release: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const pool = new Pool(); // create a new instance of the mocked pool
pool.connect.mockResolvedValue(pool); // mock the connect method

describe("Database Functions Mock Tests", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    await beginTransactionsDB();
  });

  afterEach(async () => {
    await rollbackTransactionsDB();
    pool.release.mockClear();
  });

  it("should get all companies", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ code: "c1", name: "Company1" }],
    });
    const companies = await getAllCompanies();
    expect(companies).toEqual([{ code: "c1", name: "Company1" }]);
    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM companies");
  });

  it("should get a company by code", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ code: "c1", name: "Company1" }],
    });
    const company = await getCompany("c1");
    expect(company).toEqual({ code: "c1", name: "Company1" });
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM companies WHERE code = $1",
      ["c1"]
    );
  });

  it("should create a new company", async () => {
    const newCompany = {
      code: "c2",
      name: "Company2",
      description: "Description",
    };
    pool.query.mockResolvedValueOnce({ rows: [newCompany] });
    const company = await createCompany("c2", "Company2", "Description");
    expect(company).toEqual(newCompany);
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO companies (code, name, description)" +
        "VALUES ($1, $2, $3) RETURNING *",
      ["c2", "Company2", "Description"]
    );
  });

  it("should update a company", async () => {
    const updatedCompany = {
      code: "c1",
      name: "UpdatedCompany1",
      description: "UpdatedDescription",
    };
    pool.query.mockResolvedValueOnce({ rows: [updatedCompany] });
    const company = await updateCompany(
      "c1",
      "UpdatedCompany1",
      "UpdatedDescription"
    );
    expect(company).toEqual(updatedCompany);
    expect(pool.query).toHaveBeenCalledWith(
      "UPDATE companies SET name = $1, description = $2" +
        "WHERE code = $3 RETURNING *",
      ["UpdatedCompany1", "UpdatedDescription", "c1"]
    );
  });

  it("should delete a company", async () => {
    const deletedCompany = {
      code: "c1",
      name: "Company1",
      description: "Description",
    };
    pool.query.mockResolvedValueOnce({ rows: [deletedCompany] });
    const company = await deleteCompany("c1");
    expect(company).toEqual(deletedCompany);
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM companies WHERE code = $1 RETURNING *",
      ["c1"]
    );
  });

  it("should get all invoices", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100 }],
    });
    const invoices = await getAllInvoices();
    expect(invoices).toEqual([{ id: 1, comp_code: "c1", amt: 100 }]);
    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM invoices");
  });

  it("should get an invoice by id", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100 }],
    });
    const invoice = await getInvoice(1);
    expect(invoice).toEqual({ id: 1, comp_code: "c1", amt: 100 });
  });

  it("should create a new invoice", async () => {
    const newInvoice = {
      id: 2,
      comp_code: "c1",
      amt: 200,
      paid: false,
      paid_date: null,
    };
    pool.query.mockResolvedValueOnce({ rows: [newInvoice] });
    const invoice = await createInvoice("c1", 200);
    expect(invoice).toEqual(newInvoice);
  });

  it("should update an invoice", async () => {
    const updatedInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 300,
      paid: true,
      paid_date: "2023-01-01",
    };
    pool.query.mockResolvedValueOnce({ rows: [updatedInvoice] });
    const invoice = await updateInvoice(1, {
      amt: 300,
      paid: true,
      paid_date: "2023-01-01",
    });
    expect(invoice).toEqual(updatedInvoice);
  });

  it("should delete an invoice", async () => {
    const deletedInvoice = { id: 1, comp_code: "c1", amt: 100 };
    pool.query.mockResolvedValueOnce({ rows: [deletedInvoice] });
    const invoice = await deleteInvoice(1);
    expect(invoice).toEqual(deletedInvoice);
  });

  it("should get all invoices for a company", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100 }],
    });
    const invoices = await getAllCompanyInvoices("c1");
    expect(invoices).toEqual([{ id: 1, comp_code: "c1", amt: 100 }]);
  });

  it("should get the total number of invoices", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ count: "3" }] });
    const count = await getInvoiceCount();
    expect(count).toEqual(3);
  });

  it("should get unpaid invoices", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100, paid: false }],
    });
    const invoices = await getUnpaidInvoices();
    expect(invoices).toEqual([
      { id: 1, comp_code: "c1", amt: 100, paid: false },
    ]);
  });

  it("should get paid invoices", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100, paid: true }],
    });
    const invoices = await getPaidInvoices();
    expect(invoices).toEqual([
      { id: 1, comp_code: "c1", amt: 100, paid: true },
    ]);
  });

  it("should get all companies with their invoices", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ code: "c1", name: "Company1", id: 1, amt: 100 }],
    });
    const companies = await getAllCompaniesWithInvoices();
    expect(companies).toEqual([
      { code: "c1", name: "Company1", id: 1, amt: 100 },
    ]);
  });

  it("should get the latest invoice", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100 }],
    });
    const invoice = await getLatestInvoice();
    expect(invoice).toEqual({ id: 1, comp_code: "c1", amt: 100 });
  });

  it("should get invoices by date range", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100 }],
    });
    const invoices = await getInvoicesByDateRange("2023-01-01", "2023-12-31");
    expect(invoices).toEqual([{ id: 1, comp_code: "c1", amt: 100 }]);
  });

  it("should get a company with its invoices", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ code: "c1", name: "Company1", id: 1, amt: 100 }],
    });
    const company = await getCompanyWithInvoices("c1");
    expect(company).toEqual([
      { code: "c1", name: "Company1", id: 1, amt: 100 },
    ]);
  });

  it("should get due invoices", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, comp_code: "c1", amt: 100 }],
    });
    const invoices = await getDueInvoices();
    expect(invoices).toEqual([{ id: 1, comp_code: "c1", amt: 100 }]);
  });

  it("should update the paid status and paid date of an invoice", async () => {
    const updatedInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 100,
      paid: true,
      paid_date: "2023-01-01",
    };
    pool.query.mockResolvedValueOnce({ rows: [updatedInvoice] });
    const invoice = await updateInvoicePaidStatus(1, true, "2023-01-01");
    expect(invoice).toEqual(updatedInvoice);
  });
});
