import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-response";
import { signInSchema } from "@/lib/validations";

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password credentials
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return errorResponse("Invalid email or password", 401);
    }

    // Check if user signed up with Google
    if (user.provider === "google") {
      return errorResponse(
        "This account uses Google Sign-In. Please sign in with Google.",
        401
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
      provider: user.provider,
    });

    return successResponse(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          provider: user.provider,
          image: user.image,
          createdAt: user.createdAt,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
