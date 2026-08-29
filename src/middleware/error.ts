import type { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import { HttpError, NotFoundError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

// Wraps a possibly-async handler so a rejected promise reaches the error handler. (Express 5 also
// forwards sync throws and rejected promises, but the wrapper keeps the intent explicit.)
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Any unmatched route becomes a clean 404 instead of Express's default HTML.
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError("route not found"));
}

// Central error handler. Maps typed HttpErrors to their status; anything else is a 500 with a
// generic message — internal details and stack traces are logged, never sent to the client.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.expose ? err.message : "internal server error" });
    return;
  }
  logger.error({ err }, "unhandled error");
  res.status(500).json({ error: "internal server error" });
};
