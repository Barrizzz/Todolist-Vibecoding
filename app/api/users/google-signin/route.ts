import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-response";
import { googleSignInSchema } from "@/lib/validations";

/**
 * @swagger
 * /api/users/google-signin:
 *   post:
 *     summary: Sign in with Google
 *     description: Authenticate user using Firebase Google ID token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase ID token from Google Sign-In
 *     responses:
 *       200:
 *         description: Google sign-in successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid Firebase token
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = googleSignInSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const { idToken } = result.data;

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return errorResponse("Invalid or expired Firebase token", 401);
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return errorResponse("Email not provided by Google account", 400);
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name ?? undefined,
        image: picture ?? undefined,
        provider: "google",
      },
      create: {
        email,
        name: name ?? null,
        image: picture ?? null,
        provider: "google",
      },
    });

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
      "Google sign-in successful"
    );
  } catch (error) {
    console.error("Google sign-in error:", error);
    return errorResponse("Internal server error", 500);
  }
}
