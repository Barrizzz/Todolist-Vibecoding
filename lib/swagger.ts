import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Todo List API",
        version: "1.0.0",
        description:
          "A full-stack Todo List REST API built with Next.js, Better-auth, Firebase Authentication, and Prisma ORM with PostgreSQL.",
        contact: {
          name: "API Support",
          email: "support@todolist.com",
        },
      },
      tags: [
        {
          name: "Authentication",
          description: "User authentication endpoints (register, login, Google OAuth)",
        },
        {
          name: "Users",
          description: "User profile management",
        },
        {
          name: "Todos",
          description: "CRUD operations for todo items",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter your JWT token obtained from login or register",
          },
        },
        schemas: {
          AuthResponse: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Login successful" },
              data: {
                type: "object",
                properties: {
                  token: {
                    type: "string",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                  user: {
                    $ref: "#/components/schemas/UserProfile",
                  },
                },
              },
            },
          },
          UserProfile: {
            type: "object",
            properties: {
              id: { type: "string", example: "cuid123abc" },
              name: { type: "string", example: "John Doe" },
              email: { type: "string", example: "john@example.com" },
              provider: { type: "string", example: "credentials" },
              image: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          Todo: {
            type: "object",
            properties: {
              id: { type: "string", example: "cuid456def" },
              title: { type: "string", example: "Learn Next.js" },
              description: { type: "string", nullable: true },
              completed: { type: "boolean", example: false },
              priority: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH"],
                example: "MEDIUM",
              },
              dueDate: { type: "string", format: "date-time", nullable: true },
              userId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          CreateTodo: {
            type: "object",
            required: ["title"],
            properties: {
              title: {
                type: "string",
                example: "Learn Next.js",
                maxLength: 200,
              },
              description: {
                type: "string",
                nullable: true,
                example: "Study the App Router and Server Components",
              },
              priority: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH"],
                default: "MEDIUM",
              },
              dueDate: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
            },
          },
          UpdateTodo: {
            type: "object",
            properties: {
              title: { type: "string", maxLength: 200 },
              description: { type: "string", nullable: true },
              completed: { type: "boolean" },
              priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
              dueDate: { type: "string", format: "date-time", nullable: true },
            },
          },
        },
      },
    },
  });
  return spec;
};
