import type { Request, Response, NextFunction } from "express";
import { findUserByToken } from "../data/store.js";
import { UnauthorizedError, ForbiddenError } from "../lib/errors.js";

// Only well-formed bearer tokens are considered. The character class keeps arbitrary header
// content from reaching the lookup.
const BEARER = /^Bearer\s+([A-Za-z0-9._-]+)$/;

// Resolves `Authorization: Bearer <token>` to a seed identity and attaches it to the request.
// Missing/malformed/unknown tokens are rejected with 401 — never a 200 with data.
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  if (!header) {
    throw new UnauthorizedError("missing Authorization header");
  }

  const match = BEARER.exec(header.trim());
  if (!match) {
    throw new UnauthorizedError("malformed Authorization header");
  }

  const user = findUserByToken(match[1]);
  if (!user) {
    throw new UnauthorizedError("invalid token");
  }

  req.auth = { userId: user.id, tenantId: user.tenantId, role: user.role };
  next();
}

// Returns the authenticated identity or throws 401. Use inside handlers that run after
// authMiddleware to read `req.auth` without a non-null assertion.
export function authOf(req: Request): NonNullable<Request["auth"]> {
  if (!req.auth) {
    throw new UnauthorizedError("authentication required");
  }
  return req.auth;
}

// Requires an authenticated admin. Must be chained AFTER authMiddleware.
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) {
    throw new UnauthorizedError("authentication required");
  }
  if (req.auth.role !== "admin") {
    throw new ForbiddenError("admin role required");
  }
  next();
}
