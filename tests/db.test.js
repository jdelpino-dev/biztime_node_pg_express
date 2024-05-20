/**
* Jest database integration tests for BizTime.
* This module tests various functions that interact with the
'companies' and 'invoices' tables.
* It includes tests for CRUD operations and other database
interactions.
*
* @module db
*/

import {
  beginTransactions,
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
  updateInvoicePaidStatus,
} from "../db.js";

process.env.NODE_ENV = "test";

describe("Database Integrations Tests", () => {
  let client;

  beforeEach(async () => {
    client = await beginTransactions(pool);
    await client.query("SET TIME ZONE 'UTC'");
  });

  afterEach(async () => {
    await rollbackTransactions(client);
    await client.release();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("should create and fetch a company", async () => {
    const newCompany = await createCompany(
      "c1",
      "Company1",
      "Description1",
      client
    );
    expect(newCompany).toMatchObject({
      code: "c1",
      name: "Company1",
      description: "Description1",
    });

    const fetchedCompany = await getCompany("c1", client);
    expect(fetchedCompany).toMatchObject({
      code: "c1",
      name: "Company1",
      description: "Description1",
    });
  });

  it("should update a company", async () => {
    await createCompany("c2", "Company2", "Description2", client);
    const updatedCompany = await updateCompany(
      "c2",
      "UpdatedCompany2",
      "UpdatedDescription2",
      client
    );
    expect(updatedCompany).toMatchObject({
      code: "c2",
      name: "UpdatedCompany2",
      description: "UpdatedDescription2",
    });

    const fetchedCompany = await getCompany("c2", client);
    expect(fetchedCompany).toMatchObject({
      code: "c2",
      name: "UpdatedCompany2",
      description: "UpdatedDescription2",
    });
  });

  it("should delete a company", async () => {
    await createCompany("c3", "Company3", "Description3", client);
    const deletedCompany = await deleteCompany("c3", client);
    expect(deletedCompany).toMatchObject({
      code: "c3",
      name: "Company3",
      description: "Description3",
    });

    const fetchedCompany = await getCompany("c3", client);
    expect(fetchedCompany).toBeUndefined();
  });

  it("should create and fetch an invoice", async () => {
    await createCompany("c4", "Company4", "Description4", client);
    const newInvoice = await createInvoice(
      "c4",
      500,
      undefined,
      undefined,
      undefined,
      client
    );
    expect(newInvoice).toMatchObject({ comp_code: "c4", amt: 500 });

    const fetchedInvoice = await getInvoice(newInvoice.id, client);
    expect(fetchedInvoice).toMatchObject({ comp_code: "c4", amt: 500 });
  });

  it("should update an invoice", async () => {
    await createCompany("c5", "Company5", "Description5", client);
    const newInvoice = await createInvoice(
      "c5",
      200,
      undefined,
      undefined,
      undefined,
      client
    );
    const updatedInvoice = await updateInvoice(
      newInvoice.id,
      {
        amt: 300,
        paid: true,
      },
      client
    );
    expect(updatedInvoice).toMatchObject({
      comp_code: "c5",
      amt: 300,
      paid: true,
    });

    const fetchedInvoice = await getInvoice(newInvoice.id, client);
    expect(fetchedInvoice).toMatchObject({
      comp_code: "c5",
      amt: 300,
      paid: true,
    });
  });

  it("should delete an invoice", async () => {
    await createCompany("c6", "Company6", "Description6", client);
    const newInvoice = await createInvoice(
      "c6",
      300,
      undefined,
      undefined,
      undefined,
      client
    );
    const deletedInvoice = await deleteInvoice(newInvoice.id, client);
    expect(deletedInvoice).toMatchObject({ comp_code: "c6", amt: 300 });

    const fetchedInvoice = await getInvoice(newInvoice.id, client);
    expect(fetchedInvoice).toBeUndefined();
  });

  it("should get all companies", async () => {
    await createCompany("c7", "Company7", "Description7", client);
    const companies = await getAllCompanies(client);
    expect(companies).toEqual(
      expect.arrayContaining([
        { code: "c7", name: "Company7", description: "Description7" },
      ])
    );
  });

  it("should get all invoices", async () => {
    await createCompany("c8", "Company8", "Description8", client);
    const newInvoice = await createInvoice(
      "c8",
      800,
      undefined,
      undefined,
      undefined,
      client
    );
    const invoices = await getAllInvoices(client);
    expect(invoices).toEqual(
      expect.arrayContaining([
        {
          id: newInvoice.id,
          comp_code: "c8",
          amt: 800,
          paid: false,
          add_date: expect.any(Date),
          paid_date: null,
        },
      ])
    );
  });

  it("should get all companies with their invoices", async () => {
    await createCompany("c9", "Company9", "Description9", client);
    const newInvoice = await createInvoice(
      "c9",
      900,
      undefined,
      undefined,
      undefined,
      client
    );
    const companiesWithInvoices = await getAllCompaniesWithInvoices(client);
    expect(companiesWithInvoices).toEqual(
      expect.arrayContaining([
        {
          code: "c9",
          name: "Company9",
          description: "Description9",
          id: newInvoice.id,
          amt: 900,
          paid: false,
          add_date: expect.any(Date),
          paid_date: null,
        },
      ])
    );
  });

  it("should get all invoices for a company", async () => {
    await createCompany("c10", "Company10", "Description10", client);
    const newInvoice = await createInvoice(
      "c10",
      1000,
      undefined,
      undefined,
      undefined,
      client
    );
    const invoices = await getAllCompanyInvoices("c10", client);
    expect(invoices).toEqual(
      expect.arrayContaining([
        {
          comp_code: "c10",
          id: newInvoice.id,
          amt: 1000,
          paid: false,
          add_date: expect.any(Date),
          paid_date: null,
        },
      ])
    );
  });

  it("should get the total number of invoices", async () => {
    let count = await getInvoiceCount(client);
    expect(count).toBe(0);

    await createCompany("c11", "Company11", "Description11", client);
    await createInvoice("c11", 1100, undefined, undefined, undefined, client);
    count = await getInvoiceCount(client);
    expect(count).toBe(1);

    await createInvoice("c11", 56, undefined, undefined, undefined, client);
    count = await getInvoiceCount(client);
    expect(count).toBe(2);

    await createCompany("c12", "Company12", "Description12", client);
    await createInvoice("c12", 100, undefined, undefined, undefined, client);
    count = await getInvoiceCount(client);
    expect(count).toBe(3);
  });

  it("should get unpaid invoices", async () => {
    await createCompany("c12", "Company12", "Description12", client);
    const newInvoice = await createInvoice(
      "c12",
      1200,
      undefined,
      undefined,
      undefined,
      client
    );
    const unpaidInvoices = await getUnpaidInvoices(client);
    expect(unpaidInvoices).toEqual(
      expect.arrayContaining([
        {
          comp_code: "c12",
          id: newInvoice.id,
          amt: 1200,
          paid: false,
          add_date: expect.any(Date),
          paid_date: null,
        },
      ])
    );
  });

  it("should get paid invoices", async () => {
    await createCompany("c13", "Company13", "Description13", client);
    const newInvoice = await createInvoice(
      "c13",
      1300,
      undefined,
      undefined,
      undefined,
      client
    );
    await updateInvoicePaidStatus(newInvoice.id, true, undefined, client);
    const paidInvoices = await getPaidInvoices(client);
    expect(paidInvoices).toEqual(
      expect.arrayContaining([
        {
          id: newInvoice.id,
          comp_code: "c13",
          amt: 1300,
          paid: true,
          add_date: expect.any(Date),
          paid_date: null,
        },
      ])
    );
  });

  it("should get the latest invoice", async () => {
    await createCompany("c14", "Company14", "Description14", client);
    const newInvoice = await createInvoice(
      "c14",
      1400,
      undefined,
      undefined,
      undefined,
      client
    );
    const latestInvoice = await getLatestInvoice(client);
    expect(latestInvoice).toMatchObject({
      id: newInvoice.id,
      comp_code: "c14",
      amt: 1400,
      add_date: expect.any(Date),
      paid: false,
      paid_date: null,
    });
  });

  it("should get invoices by date range", async () => {
    await createCompany("c15", "Company15", "Description15", client);
    let startDate = new Date("2023-01-01T00:00:00.000");
    let endDate = new Date("2023-12-31T00:00:00.000");
    const newInvoice = await createInvoice(
      "c15",
      1500,
      false,
      startDate,
      undefined,
      client
    );
    const invoices = await getInvoicesByDateRange(startDate, endDate, client);

    // Normalize dates in dueInvoices for comparison
    const normalizedInvoices = invoices.map((invoice) => ({
      ...invoice,
      add_date: new Date(invoice.add_date).toISOString(),
      paid_date: invoice.paid_date
        ? new Date(invoice.paid_date).toISOString()
        : null,
    }));

    expect(normalizedInvoices).toEqual(
      expect.arrayContaining([
        {
          id: newInvoice.id,
          comp_code: "c15",
          amt: 1500,
          add_date: "2023-01-01T06:00:00.000Z",
          paid: false,
          paid_date: null,
        },
      ])
    );
  });

  it("should get a company with its invoices", async () => {
    await createCompany("c16", "Company16", "Description16", client);
    const newInvoice = await createInvoice(
      "c16",
      1600,
      undefined,
      undefined,
      undefined,
      client
    );
    const companyWithInvoices = await getCompanyWithInvoices("c16", client);
    expect(companyWithInvoices).toEqual(
      expect.arrayContaining([
        {
          code: "c16",
          name: "Company16",
          description: "Description16",
          id: newInvoice.id,
          amt: 1600,
          paid: false,
          add_date: expect.any(Date),
          paid_date: null,
        },
      ])
    );
  });

  it("should get due invoices", async () => {
    await createCompany("c17", "Company17", "Description17", client);
    let pastDate = new Date("2022-01-01T00:00:00.000");
    const newInvoice = await createInvoice(
      "c17",
      1700,
      false,
      undefined,
      pastDate,
      client
    );

    const dueInvoices = await getDueInvoices(client);

    // Normalize dates in dueInvoices for comparison
    const normalizedDueInvoices = dueInvoices.map((invoice) => ({
      ...invoice,
      add_date: new Date(invoice.add_date).toISOString(),
      paid_date: invoice.paid_date
        ? new Date(invoice.paid_date).toISOString()
        : null,
    }));

    // Ensure the expected date is also in ISO string format
    const expectedInvoice = {
      comp_code: "c17",
      id: newInvoice.id,
      amt: 1700,
      paid: false,
      add_date: expect.any(String), // Compare as string
      paid_date: pastDate.toISOString(), // Convert pastDate to string for comparison
    };

    expect(normalizedDueInvoices).toEqual(
      expect.arrayContaining([expectedInvoice])
    );
  });

  it("should update the paid status and paid date of an invoice", async () => {
    await createCompany("c18", "Company18", "Description18", client);
    const newInvoice = await createInvoice(
      "c18",
      1800,
      undefined,
      undefined,
      undefined,
      client
    );
    const updatedInvoice = await updateInvoicePaidStatus(
      newInvoice.id,
      true,
      new Date(),
      client
    );
    expect(updatedInvoice).toMatchObject({
      id: newInvoice.id,
      comp_code: "c18",
      amt: 1800,
      paid: true,
    });
  });
});
