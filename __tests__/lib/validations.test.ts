import {
  signUpSchema,
  signInSchema,
  createTodoSchema,
  updateTodoSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  // ─── Sign Up ───────────────────────────────────────────────────────────────
  describe("signUpSchema", () => {
    const valid = { name: "John Doe", email: "john@example.com", password: "Password1" };

    it("accepts a valid sign-up payload", () => {
      expect(signUpSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects a name shorter than 2 characters", () => {
      const result = signUpSchema.safeParse({ ...valid, name: "J" });
      expect(result.success).toBe(false);
    });

    it("rejects an invalid email", () => {
      const result = signUpSchema.safeParse({ ...valid, email: "not-an-email" });
      expect(result.success).toBe(false);
    });

    it("rejects a password shorter than 8 characters", () => {
      const result = signUpSchema.safeParse({ ...valid, password: "Pass1" });
      expect(result.success).toBe(false);
    });

    it("rejects a password without an uppercase letter", () => {
      const result = signUpSchema.safeParse({ ...valid, password: "password1" });
      expect(result.success).toBe(false);
    });

    it("rejects a password without a digit", () => {
      const result = signUpSchema.safeParse({ ...valid, password: "PasswordNoNum" });
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      expect(signUpSchema.safeParse({}).success).toBe(false);
    });
  });

  // ─── Sign In ───────────────────────────────────────────────────────────────
  describe("signInSchema", () => {
    const valid = { email: "john@example.com", password: "anypassword" };

    it("accepts valid sign-in credentials", () => {
      expect(signInSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects an invalid email", () => {
      expect(signInSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false);
    });

    it("rejects an empty password", () => {
      expect(signInSchema.safeParse({ ...valid, password: "" }).success).toBe(false);
    });
  });

  // ─── Create Todo ───────────────────────────────────────────────────────────
  describe("createTodoSchema", () => {
    const valid = { title: "Buy groceries" };

    it("accepts a minimal valid payload (title only)", () => {
      expect(createTodoSchema.safeParse(valid).success).toBe(true);
    });

    it("defaults priority to MEDIUM when omitted", () => {
      const result = createTodoSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.priority).toBe("MEDIUM");
    });

    it("accepts all optional fields", () => {
      const result = createTodoSchema.safeParse({
        title: "Buy groceries",
        description: "Milk, eggs, bread",
        priority: "HIGH",
        dueDate: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it("rejects an empty title", () => {
      expect(createTodoSchema.safeParse({ title: "" }).success).toBe(false);
    });

    it("rejects a title that exceeds 200 characters", () => {
      expect(createTodoSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false);
    });

    it("rejects an invalid priority value", () => {
      expect(createTodoSchema.safeParse({ title: "t", priority: "CRITICAL" }).success).toBe(false);
    });

    it("rejects an invalid date string", () => {
      expect(createTodoSchema.safeParse({ title: "t", dueDate: "not-a-date" }).success).toBe(false);
    });
  });

  // ─── Update Todo ───────────────────────────────────────────────────────────
  describe("updateTodoSchema", () => {
    it("accepts an empty object (all fields optional)", () => {
      expect(updateTodoSchema.safeParse({}).success).toBe(true);
    });

    it("accepts partial updates — completed flag only", () => {
      expect(updateTodoSchema.safeParse({ completed: true }).success).toBe(true);
    });

    it("accepts partial updates — priority change", () => {
      expect(updateTodoSchema.safeParse({ priority: "LOW" }).success).toBe(true);
    });

    it("rejects an empty title when provided", () => {
      expect(updateTodoSchema.safeParse({ title: "" }).success).toBe(false);
    });

    it("rejects an invalid priority", () => {
      expect(updateTodoSchema.safeParse({ priority: "URGENT" }).success).toBe(false);
    });
  });
});
