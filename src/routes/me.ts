import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";

export const meRouter = Router();

// Returns the authenticated caller's own identity — never anyone else's.
meRouter.get("/me", authMiddleware, (req: Request, res: Response) => {
  const auth = req.auth;
  if (!auth) {
    // Unreachable after authMiddleware; narrows the type and fails safe.
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  res.json({ userId: auth.userId, tenantId: auth.tenantId, role: auth.role });
});
