import type { Request, Response, NextFunction } from "express";
import { tokens } from "./data.js";

// Reads `Authorization: Bearer <token>`, resolves it to a seed identity, and attaches
// tenantId + role to the request. Rejects missing/invalid tokens with 401.
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    res.status(401).json({ error: "missing or malformed Authorization header" });
    return;
  }

  const identity = tokens[match[1].trim()];
  if (!identity) {
    res.status(401).json({ error: "invalid token" });
    return;
  }

  req.tenantId = identity.tenantId;
  req.role = identity.role;
  next();
}
