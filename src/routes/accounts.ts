import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authMiddleware, authOf } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getOwnedAccount, getOwnedAccountTransactions, listTenantAccounts } from "../services/accounts.js";

export const accountsRouter = Router();

const accountIdParams = z.object({
  id: z.string().regex(/^acc-[a-z]-\d{3}$/, "must look like acc-x-000"),
});

// List the caller's own tenant's accounts.
accountsRouter.get("/accounts", authMiddleware, (req: Request, res: Response) => {
  const { tenantId } = authOf(req);
  res.json({ accounts: listTenantAccounts(tenantId) });
});

// Fetch one account — only if it belongs to the caller's tenant (else 403 / 404).
accountsRouter.get(
  "/accounts/:id",
  authMiddleware,
  validate({ params: accountIdParams }),
  (req: Request, res: Response) => {
    const { tenantId } = authOf(req);
    const { id } = accountIdParams.parse(req.params);
    res.json(getOwnedAccount(id, tenantId));
  },
);

// Transactions for an owned account.
accountsRouter.get(
  "/accounts/:id/transactions",
  authMiddleware,
  validate({ params: accountIdParams }),
  (req: Request, res: Response) => {
    const { tenantId } = authOf(req);
    const { id } = accountIdParams.parse(req.params);
    res.json({ transactions: getOwnedAccountTransactions(id, tenantId) });
  },
);
