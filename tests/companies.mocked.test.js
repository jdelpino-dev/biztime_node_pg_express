import request from "supertest";
import app from "../app.js";
import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getAllCompanyInvoices,
  getCompany,
  updateCompany,
} from "../db.js";

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

beforeAll(() => {
  jest.clearAllMocks();
});

describe("Companies Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /companies - should return a list of companies", async () => {
    const mockCompanies = [
      { code: "c1", name: "Company1" },
      { code: "c2", name: "Company2" },
    ];
    getAllCompanies.mockResolvedValueOnce(mockCompanies);

    const res = await request(app).get("/companies");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: mockCompanies });
    expect(getAllCompanies).toHaveBeenCalledTimes(1);
  });

  test("GET /companies/:code - should return a company with invoices", async () => {
    const mockCompany = {
      code: "c1",
      name: "Company1",
      description: "Test Company",
    };
    const mockInvoices = [{ id: 1 }, { id: 2 }];
    getCompany.mockResolvedValueOnce(mockCompany);
    getAllCompanyInvoices.mockResolvedValueOnce(mockInvoices);

    const res = await request(app).get("/companies/c1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { ...mockCompany, invoices: [1, 2] },
    });
    expect(getCompany).toHaveBeenCalledWith("c1");
    expect(getAllCompanyInvoices).toHaveBeenCalledWith("c1");
  });

  test("GET /companies/:code - should return 404 if company not found", async () => {
    getCompany.mockResolvedValueOnce(null);

    const res = await request(app).get("/companies/c1");

    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe("Company not found");
  });

  test("POST /companies - should create a new company", async () => {
    const newCompany = {
      code: "c1",
      name: "Company1",
      description: "Test Company",
    };
    createCompany.mockResolvedValueOnce(newCompany);

    const res = await request(app).post("/companies").send(newCompany);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ company: newCompany });
    expect(createCompany).toHaveBeenCalledWith(
      "c1",
      "Company1",
      "Test Company"
    );
  });

  test("PUT /companies/:code - should update an existing company", async () => {
    const updatedCompany = {
      code: "c1",
      name: "Updated Company",
      description: "Updated Description",
    };
    updateCompany.mockResolvedValueOnce(updatedCompany);

    const res = await request(app)
      .put("/companies/c1")
      .send({ name: "Updated Company", description: "Updated Description" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: updatedCompany });
    expect(updateCompany).toHaveBeenCalledWith(
      "c1",
      "Updated Company",
      "Updated Description"
    );
  });

  test("PUT /companies/:code - should return 404 if company not found", async () => {
    updateCompany.mockResolvedValueOnce(null);

    const res = await request(app)
      .put("/companies/c1")
      .send({ name: "Updated Company", description: "Updated Description" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe("Company not found");
  });

  test("DELETE /companies/:code - should delete a company", async () => {
    const mockCompany = {
      code: "c1",
      name: "Company1",
      description: "Test Company",
    };
    deleteCompany.mockResolvedValueOnce(mockCompany);

    const res = await request(app).delete("/companies/c1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
    expect(deleteCompany).toHaveBeenCalledWith("c1");
  });

  test("DELETE /companies/:code - should return 404 if company not found", async () => {
    deleteCompany.mockResolvedValueOnce(null);

    const res = await request(app).delete("/companies/c1");

    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe("Company not found");
  });
});
