import { NextRequest } from "next/server";
import { extractTokenFromHeader, verifyToken, JWTPayload } from "@/lib/jwt";
import { errorResponse } from "@/lib/api-response";

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: JWTPayload) => Promise<Response>
): Promise<Response> {
  const authHeader = req.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return errorResponse("Authentication required. Please sign in.", 401);
  }

  const user = verifyToken(token);

  if (!user) {
    return errorResponse("Invalid or expired token. Please sign in again.", 401);
  }

  return handler(req, user);
}
