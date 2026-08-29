import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType } from "zod";
import { BadRequestError } from "../lib/errors.js";

interface Schemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

// Validates request parts against zod schemas and rejects invalid input with 400 before it
// reaches a handler. Does not mutate the request (Express 5's `req.query` is read-only); handlers
// re-parse the already-validated part when they need the typed value.
export function validate(schemas: Schemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        const detail = result.error.issues
          .map((issue) => `${issue.path.join(".") || part} ${issue.message}`)
          .join("; ");
        throw new BadRequestError(`invalid ${part}: ${detail}`);
      }
    }
    next();
  };
}
