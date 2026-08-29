import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authMiddleware, authOf } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { executeTransfer } from "../services/transfers.js";

export const transfersRouter = Router();

const transferBody = z.object({
  fromAccountId: z.string().regex(/^acc-[a-z]-\d{3}$/),
  toAccountId: z.string().regex(/^acc-[a-z]-\d{3}$/),
  amount: z.number().positive().max(1_000_000_000),
});

// Move funds between two accounts the caller's tenant owns. The service enforces ownership on
// both legs, so there is no cross-tenant transfer.
transfersRouter.post(
  "/transfers",
  authMiddleware,
  validate({ body: transferBody }),
  (req: Request, res: Response) => {
    const { tenantId } = authOf(req);
    const input = transferBody.parse(req.body);
    const result = executeTransfer(tenantId, input);
    res.status(201).json({ ok: true, from: result.from, to: result.to });
  },
);
