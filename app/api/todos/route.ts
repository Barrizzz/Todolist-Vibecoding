import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import { JWTPayload } from "@/lib/jwt";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { createTodoSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     description: Retrieve all todos for the authenticated user with optional filtering and pagination
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: Todos retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
      const completedParam = searchParams.get("completed");
      const priority = searchParams.get("priority") as "LOW" | "MEDIUM" | "HIGH" | null;
      const search = searchParams.get("search") || "";

      const where: Prisma.TodoWhereInput = {
        userId: user.userId,
        ...(completedParam !== null && { completed: completedParam === "true" }),
        ...(priority && { priority }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const [todos, total] = await Promise.all([
        prisma.todo.findMany({
          where,
          orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.todo.count({ where }),
      ]);

      return paginatedResponse(todos, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Get todos error:", error);
      return errorResponse("Internal server error", 500);
    }
  });
}

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a todo
 *     description: Create a new todo item for the authenticated user
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodo'
 *     responses:
 *       201:
 *         description: Todo created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (request: NextRequest, user: JWTPayload) => {
    try {
      const body = await request.json();
      const result = createTodoSchema.safeParse(body);

      if (!result.success) {
        return errorResponse("Validation failed", 400, result.error.flatten().fieldErrors);
      }

      const { title, description, priority, dueDate } = result.data;

      const todo = await prisma.todo.create({
        data: {
          title,
          description: description ?? null,
          priority: priority || "MEDIUM",
          dueDate: dueDate ? new Date(dueDate) : null,
          userId: user.userId,
        },
      });

      return successResponse(todo, "Todo created successfully", 201);
    } catch (error) {
      console.error("Create todo error:", error);
      return errorResponse("Internal server error", 500);
    }
  });
}
