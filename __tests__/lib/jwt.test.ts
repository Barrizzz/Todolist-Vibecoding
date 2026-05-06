import { signToken, verifyToken, extractTokenFromHeader } from "@/lib/jwt";

describe("JWT Utilities", () => {
  const mockPayload = {
    userId: "user-123",
    email: "test@example.com",
    name: "Test User",
    provider: "credentials",
  };

  describe("signToken", () => {
    it("should return a non-empty JWT string", () => {
      const token = signToken(mockPayload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
      // JWT has 3 parts separated by dots
      expect(token.split(".")).toHaveLength(3);
    });

    it("should produce different tokens for different payloads", () => {
      const token1 = signToken(mockPayload);
      const token2 = signToken({ ...mockPayload, userId: "user-456" });
      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should return the original payload for a valid token", () => {
      const token = signToken(mockPayload);
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.provider).toBe(mockPayload.provider);
    });

    it("should return null for an invalid token", () => {
      const result = verifyToken("invalid.token.string");
      expect(result).toBeNull();
    });

    it("should return null for a tampered token", () => {
      const token = signToken(mockPayload);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(verifyToken(tampered)).toBeNull();
    });

    it("should return null for an empty string", () => {
      expect(verifyToken("")).toBeNull();
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should extract the token from a valid Bearer header", () => {
      const token = "mytoken123";
      const result = extractTokenFromHeader(`Bearer ${token}`);
      expect(result).toBe(token);
    });

    it("should return null for a null header", () => {
      expect(extractTokenFromHeader(null)).toBeNull();
    });

    it("should return null if scheme is not Bearer", () => {
      expect(extractTokenFromHeader("Basic sometoken")).toBeNull();
    });

    it("should return null for a malformed header (no space)", () => {
      expect(extractTokenFromHeader("BearerNoSpace")).toBeNull();
    });

    it("should return null for an empty string", () => {
      expect(extractTokenFromHeader("")).toBeNull();
    });
  });
});
