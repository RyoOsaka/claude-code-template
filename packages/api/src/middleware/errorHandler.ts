import type { ErrorHandler } from "hono";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    logger.warn({ err, statusCode: err.statusCode }, err.message);
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.statusCode as 400,
    );
  }

  logger.error({ err }, "Unhandled error");
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    },
    500,
  );
};
