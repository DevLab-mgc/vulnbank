import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import { allAccounts, listTenants } from "../data/store.js";

export const adminRouter = Router();

// Platform-admin overview routes. These deliberately expose data across ALL tenants, so every one
// of them MUST be chained with authMiddleware + requireAdmin. That pairing is the access-control
// contract for anything under /admin.

adminRouter.get("/admin/tenants", authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  res.json({ tenants: listTenants() });
});

adminRouter.get("/admin/accounts", authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  res.json({ accounts: allAccounts() });
});

// Ops balances overview across the bank.
adminRouter.get("/admin/balances", (_req: Request, res: Response) => {
  const balances = allAccounts().map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    owner: a.owner,
    balance: a.balance,
    currency: a.currency,
  }));
  res.json({ balances });
});
