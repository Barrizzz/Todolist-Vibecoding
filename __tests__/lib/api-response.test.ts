/**
 * @jest-environment node
 */
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";

describe("API Response Helpers", () => {
  describe("successResponse", () => {
    it("returns a 200 response by default", async () => {
      const res = successResponse({ id: "1" });
      expect(res.status).toBe(200);
    });

    it("includes success:true, message, and data in the body", async () => {
      const data = { id: "abc", title: "Test" };
      const res = successResponse(data, "Created");
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Created");
      expect(body.data).toEqual(data);
    });

    it("honours a custom status code", async () => {
      const res = successResponse(null, "Created", 201);
      expect(res.status).toBe(201);
    });
  });

  describe("errorResponse", () => {
    it("returns a 400 response by default", async () => {
      const res = errorResponse("Something went wrong");
      expect(res.status).toBe(400);
    });

    it("includes success:false and the message", async () => {
      const res = errorResponse("Not found", 404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("Not found");
    });

    it("honours a custom status code", async () => {
      const res = errorResponse("Unauthorized", 401);
      expect(res.status).toBe(401);
    });

    it("includes errors field when provided", async () => {
      const errors = { email: ["Invalid email"] };
      const res = errorResponse("Validation failed", 400, errors);
      const body = await res.json();
      expect(body.errors).toEqual(errors);
    });

    it("omits errors field when not provided", async () => {
      const res = errorResponse("Bad request");
      const body = await res.json();
      expect(body.errors).toBeUndefined();
    });
  });

  describe("paginatedResponse", () => {
    const items = [{ id: "1" }, { id: "2" }];
    const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };

    it("returns status 200", async () => {
      const res = paginatedResponse(items, pagination);
      expect(res.status).toBe(200);
    });

    it("includes data and pagination in the body", async () => {
      const res = paginatedResponse(items, pagination, "Fetched");
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(items);
      expect(body.pagination).toEqual(pagination);
      expect(body.message).toBe("Fetched");
    });
  });
});
