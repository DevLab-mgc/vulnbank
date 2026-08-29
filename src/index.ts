import express from "express";
import type { Request, Response } from "express";
import { authMiddleware, requireAdmin } from "./auth.js";
import { accounts } from "./data.js";

const app = express();
app.use(express.json());

// Public health check.
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Protected: return an account only if it belongs to the caller's tenant, else 403.
app.get("/accounts/:id", authMiddleware, (req: Request, res: Response) => {
  const account = accounts.find((a) => a.id === req.params.id);
  if (!account) {
    res.status(404).json({ error: "account not found" });
    return;
  }
  if (account.tenantId !== req.tenantId) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  res.json(account);
});

// Admin: list every tenant's balances across the bank. Authenticated admins only.
app.get("/admin/balances", authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  const balances = accounts.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    owner: a.owner,
    balance: a.balance,
    currency: a.currency,
  }));
  res.json({ balances });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`vulnbank listening on :${PORT}`);
});
