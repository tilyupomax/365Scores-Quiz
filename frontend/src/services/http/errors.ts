import type { ApiErrorResponse } from "./types";
import type { AxiosError } from "axios";

function normalizeMessage(message: string | string[] | undefined): string {
  if (!message) {
    return "Unexpected API error";
  }

  if (Array.isArray(message)) {
    return message.join("\n");
  }

  return message;
}

export class ApiError extends Error {
  statusCode?: number;
  details?: string | string[];

  constructor(
    message: string,
    options?: { statusCode?: number; details?: string | string[]; cause?: unknown },
  ) {
    super(message, options);
    this.name = "ApiError";
    this.statusCode = options?.statusCode;
    this.details = options?.details;
  }

  static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    const response = error.response?.data;
    const statusCode = error.response?.status ?? response?.statusCode;
    const message = normalizeMessage(response?.message) || error.message;

    return new ApiError(message, {
      statusCode,
      details: response?.message,
      cause: error,
    });
  }
}
