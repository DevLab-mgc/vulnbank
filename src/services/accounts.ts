import type { Account, Transaction } from "../data/store.js";
import { accountsByTenant, findAccount, transactionsByAccount } from "../data/store.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";

// Accounts visible to a tenant — only its own.
export function listTenantAccounts(tenantId: string): Account[] {
  return accountsByTenant(tenantId);
}

// Fetch an account the tenant owns. 404 if it doesn't exist; 403 if it belongs to another tenant.
// This single choke point is where cross-tenant access is denied — every account read goes
// through it.
export function getOwnedAccount(accountId: string, tenantId: string): Account {
  const account = findAccount(accountId);
  if (!account) {
    throw new NotFoundError("account not found");
  }
  if (account.tenantId !== tenantId) {
    throw new ForbiddenError("forbidden");
  }
  return { ...account };
}

export function getOwnedAccountTransactions(accountId: string, tenantId: string): Transaction[] {
  // Enforces ownership before returning any transactions.
  getOwnedAccount(accountId, tenantId);
  return transactionsByAccount(accountId);
}
