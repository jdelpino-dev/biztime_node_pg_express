import request from "supertest";
import app from "../app.js";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoice,
  updateInvoice,
} from "../db";

jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
    on: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

jest.mock("../db.js");

describe("Invoices Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /invoices - should return a list of invoices", async () => {
    const mockInvoices = [
      { id: 1, comp_code: "c1" },
      { id: 2, comp_code: "c2" },
    ];
    getAllInvoices.mockResolvedValueOnce(mockInvoices);

    const res = await request(app).get("/invoices");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: mockInvoices });
    expect(getAllInvoices).toHaveBeenCalledTimes(1);
  });

  test("GET /invoices/:id - should return an invoice", async () => {
    const mockInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 100,
      paid: false,
      add_date: "2023-01-01",
      paid_date: null,
    };
    getInvoice.mockResolvedValueOnce(mockInvoice);

    const res = await request(app).get("/invoices/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoice: mockInvoice });
    expect(getInvoice).toHaveBeenCalledWith("1");
  });

  test("GET /invoices/:id - should return 404 if invoice not found", async () => {
    getInvoice.mockResolvedValueOnce(null);

    const res = await request(app).get("/invoices/1");

    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe("Invoice not found");
  });

  test("POST /invoices - should create a new invoice", async () => {
    const newInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 100,
      paid: false,
      add_date: "2023-01-01",
      paid_date: null,
    };
    createInvoice.mockResolvedValueOnce(newInvoice);

    const res = await request(app)
      .post("/invoices")
      .send({ comp_code: "c1", amt: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ invoice: newInvoice });
    expect(createInvoice).toHaveBeenCalledWith("c1", 100);
  });

  test("PUT /invoices/:id - should update an existing invoice", async () => {
    const updatedInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 200,
      paid: false,
      add_date: "2023-01-01",
      paid_date: null,
    };
    updateInvoice.mockResolvedValueOnce(updatedInvoice);

    const res = await request(app).put("/invoices/1").send({ amt: 200 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoice: updatedInvoice });
    expect(updateInvoice).toHaveBeenCalledWith("1", { amt: 200 });
  });

  test("PUT /invoices/:id - should return 404 if invoice not found", async () => {
    updateInvoice.mockResolvedValueOnce(null);

    const res = await request(app).put("/invoices/1").send({ amt: 200 });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe("Invoice not found");
  });

  test("DELETE /invoices/:id - should delete an invoice", async () => {
    const mockInvoice = {
      id: 1,
      comp_code: "c1",
      amt: 100,
      paid: false,
      add_date: "2023-01-01",
      paid_date: null,
    };
    deleteInvoice.mockResolvedValueOnce(mockInvoice);

    const res = await request(app).delete("/invoices/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
    expect(deleteInvoice).toHaveBeenCalledWith("1");
  });

  test("DELETE /invoices/:id - should return 404 if invoice not found", async () => {
    deleteInvoice.mockResolvedValueOnce(null);

    const res = await request(app).delete("/invoices/1");

    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe("Invoice not found");
  });
});
