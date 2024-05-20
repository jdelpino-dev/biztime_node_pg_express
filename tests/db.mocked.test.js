/**
* Jest mock database tests for BizTime.
* This module tests various functions that interact with the
'companies' and 'invoices' tables.
* It includes tests for CRUD operations and other database
interactions using jest mocks.
*
* @module dbMock
*/

import { Pool } from "pg";
import {
  createCompany,
  createInvoice,
  deleteCompany,
  deleteInvoice,
  getAllCompanies,
  getCompany,
  getInvoice,
  getLatestInvoice,
  getPaidInvoices,
  updateInvoiceAmt,
} from "../db.js";

jest.mock("pg", () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  const mPool = {
    connect: jest.fn(() => mClient),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe("Mocked Database Tests", () => {
  let pool;
  let client;

  beforeAll(() => {
    pool = new Pool();
    client = pool.connect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create and fetch a company", async () => {
    const newCompany = {
      code: "c1",
      name: "Company1",
      description: "Description1",
    };
    client.query
      .mockResolvedValueOnce({ rows: [newCompany] })
      .mockResolvedValueOnce({ rows: [newCompany] });

    const result = await createCompany(
      "c1",
      "Company1",
      "Description1",
      client
    );
    expect(result).toEqual(newCompany);

    const fetchedCompany = await getCompany("c1", client);
    expect(fetchedCompany).toEqual(newCompany);
  });

  it("should create and fetch an invoice", async () => {
    const invoiceData = {
      id: 1,
      comp_code: "c1",
      amt: 500,
      paid: false,
      add_date: "2024-05-20",
      paid_date: null,
    };
    client.query
      .mockResolvedValueOnce({ rows: [invoiceData] })
      .mockResolvedValueOnce({ rows: [invoiceData] });

    const result = await createInvoice(
      "c1",
      500,
      false,
      new Date("2024-05-20"),
      null,
      client
    );
    expect(result).toEqual(invoiceData);

    const fetchedInvoice = await getInvoice(1, client);
    expect(fetchedInvoice).toEqual(invoiceData);
  });

  it("should update the amount of an invoice", async () => {
    const updatedInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 2000,
      paid: false,
      add_date: "2024-05-20",
      paid_date: null,
    };
    client.query.mockResolvedValueOnce({ rows: [updatedInvoice] });

    const result = await updateInvoiceAmt(1, 2000, client);
    expect(result).toEqual(updatedInvoice);
  });

  it("should get the latest invoice", async () => {
    const invoiceData = {
      id: 2,
      comp_code: "c1",
      amt: 600,
      paid: false,
      add_date: "2024-05-20",
      paid_date: null,
    };
    client.query.mockResolvedValueOnce({ rows: [invoiceData] });

    const latestInvoice = await getLatestInvoice(client);
    expect(latestInvoice).toEqual(invoiceData);
  });

  it("should delete a company", async () => {
    const deletedCompany = {
      code: "c1",
      name: "Company1",
      description: "Description1",
    };
    client.query.mockResolvedValueOnce({ rows: [deletedCompany] });

    const result = await deleteCompany("c1", client);
    expect(result).toEqual(deletedCompany);
  });

  it("should delete an invoice", async () => {
    const deletedInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 500,
      paid: false,
      add_date: "2024-05-20",
      paid_date: null,
    };
    client.query.mockResolvedValueOnce({ rows: [deletedInvoice] });

    const result = await deleteInvoice(1, client);
    expect(result).toEqual(deletedInvoice);
  });

  it("should get all companies", async () => {
    const companies = [
      {
        code: "c1",
        name: "Company1",
        description: "Description1",
      },
      {
        code: "c2",
        name: "Company2",
        description: "Description2",
      },
    ];
    client.query.mockResolvedValueOnce({ rows: companies });

    const result = await getAllCompanies(client);
    expect(result).toEqual(companies);
  });

  it("should get paid invoices", async () => {
    const paidInvoices = [
      {
        id: 1,
        comp_code: "c1",
        amt: 500,
        paid: true,
        add_date: "2024-05-20",
        paid_date: "2024-05-21",
      },
    ];
    client.query.mockResolvedValueOnce({ rows: paidInvoices });

    const result = await getPaidInvoices(client);
    expect(result).toEqual(paidInvoices);
  });
});
