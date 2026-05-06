import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import { JWTPayload } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile information
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (_, user: JWTPayload) => {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          provider: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { todos: true },
          },
        },
      });

      if (!dbUser) {
        return errorResponse("User not found", 404);
      }

      return successResponse(dbUser, "Profile retrieved successfully");
    } catch (error) {
      console.error("Get profile error:", error);
      return errorResponse("Internal server error", 500);
    }
  });
}
