import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400, errors?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message = "Success"
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination,
    },
    { status: 200 }
  );
}
