import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import { JWTPayload } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-response";
import { updateTodoSchema } from "@/lib/validations";

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     description: Retrieve a specific todo item by its ID
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (_: NextRequest, user: JWTPayload) => {
    try {
      const { id } = await params;
      const todo = await prisma.todo.findFirst({
        where: { id, userId: user.userId },
      });

      if (!todo) {
        return errorResponse("Todo not found", 404);
      }

      return successResponse(todo, "Todo retrieved successfully");
    } catch (error) {
      console.error("Get todo error:", error);
      return errorResponse("Internal server error", 500);
    }
  });
}

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     description: Update an existing todo item
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodo'
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (request: NextRequest, user: JWTPayload) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const result = updateTodoSchema.safeParse(body);

      if (!result.success) {
        return errorResponse("Validation failed", 400, result.error.flatten().fieldErrors);
      }

      // Check ownership
      const existing = await prisma.todo.findFirst({
        where: { id, userId: user.userId },
      });

      if (!existing) {
        return errorResponse("Todo not found", 404);
      }

      const { title, description, completed, priority, dueDate } = result.data;

      const todo = await prisma.todo.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(completed !== undefined && { completed }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        },
      });

      return successResponse(todo, "Todo updated successfully");
    } catch (error) {
      console.error("Update todo error:", error);
      return errorResponse("Internal server error", 500);
    }
  });
}

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     description: Delete a specific todo item
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (_: NextRequest, user: JWTPayload) => {
    try {
      const { id } = await params;

      const existing = await prisma.todo.findFirst({
        where: { id, userId: user.userId },
      });

      if (!existing) {
        return errorResponse("Todo not found", 404);
      }

      await prisma.todo.delete({ where: { id } });

      return successResponse(null, "Todo deleted successfully");
    } catch (error) {
      console.error("Delete todo error:", error);
      return errorResponse("Internal server error", 500);
    }
  });
}
