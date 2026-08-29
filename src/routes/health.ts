import { Router } from "express";
import type { Request, Response } from "express";

export const healthRouter = Router();

// Public liveness check — the only unauthenticated data route.
healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});
