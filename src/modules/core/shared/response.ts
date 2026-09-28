import { NextResponse } from "next/server";
import { AppError } from "./errors";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: { message: string; code: string; details?: Record<string, string[]> };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function errorResponse(error: AppError): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: { message: error.message, code: error.code, details: error.details } },
    { status: error.statusCode },
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) return errorResponse(error);
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return NextResponse.json(
    { success: false, error: { message, code: "INTERNAL_SERVER_ERROR" } },
    { status: 500 },
  );
}
