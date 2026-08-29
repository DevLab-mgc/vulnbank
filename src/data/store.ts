// In-memory seed data + accessors. Hardcoded on purpose — this is a demo target, not a real
// bank. The tokens are fake demo credentials, not secrets (see REVIEW.md).
//
// IMPORTANT: the accessors here are intentionally "dumb" — they do not enforce tenant isolation.
// Access control is enforced one layer up, in the services (src/services), so that the ownership
// rules are explicit and reviewable at the call site. The store is the data; the services are
// the policy.

export type Role = "user" | "admin";

export interface Tenant {
  id: string;
  name: string;
}

export interface User {
  id: string;
  token: string;
  tenantId: string;
  role: Role;
  displayName: string;
}

export interface Account {
  id: string;
  tenantId: string;
  owner: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  tenantId: string;
  type: "credit" | "debit";
  amount: number;
  ts: string;
  memo: string;
}

const tenants: Tenant[] = [
  { id: "tenant-a", name: "Acme Holdings" },
  { id: "tenant-b", name: "Beacon Capital" },
];

// Seed users. Roles: tenant users (non-admin) and one platform admin.
const users: User[] = [
  { id: "u-a-1", token: "tenant-a-token", tenantId: "tenant-a", role: "user", displayName: "Alice" },
  { id: "u-b-1", token: "tenant-b-token", tenantId: "tenant-b", role: "user", displayName: "Bob" },
  { id: "u-admin", token: "admin-token", tenantId: "tenant-a", role: "admin", displayName: "Platform Admin" },
];

const accounts: Account[] = [
  { id: "acc-a-001", tenantId: "tenant-a", owner: "Alice", balance: 42000, currency: "USD" },
  { id: "acc-a-002", tenantId: "tenant-a", owner: "Aaron", balance: 15750, currency: "USD" },
  { id: "acc-b-001", tenantId: "tenant-b", owner: "Bob", balance: 88300, currency: "USD" },
  { id: "acc-b-002", tenantId: "tenant-b", owner: "Bianca", balance: 2650, currency: "USD" },
];

const transactions: Transaction[] = [
  { id: "tx-0001", accountId: "acc-a-001", tenantId: "tenant-a", type: "credit", amount: 42000, ts: "2026-08-01T09:00:00.000Z", memo: "opening balance" },
  { id: "tx-0002", accountId: "acc-a-002", tenantId: "tenant-a", type: "credit", amount: 15750, ts: "2026-08-01T09:05:00.000Z", memo: "opening balance" },
  { id: "tx-0003", accountId: "acc-b-001", tenantId: "tenant-b", type: "credit", amount: 88300, ts: "2026-08-01T09:10:00.000Z", memo: "opening balance" },
  { id: "tx-0004", accountId: "acc-b-002", tenantId: "tenant-b", type: "credit", amount: 2650, ts: "2026-08-01T09:15:00.000Z", memo: "opening balance" },
];

// Token -> user, for O(1) auth lookups. Uses Object.create(null) to avoid prototype pollution.
const tokenIndex = new Map<string, User>(users.map((u) => [u.token, u]));

let txCounter = transactions.length;
function nextTxId(): string {
  txCounter += 1;
  return `tx-${String(txCounter).padStart(4, "0")}`;
}

// --- Accessors (no policy; see services for enforcement) ---

export function findUserByToken(token: string): User | undefined {
  return tokenIndex.get(token);
}

export function listTenants(): Tenant[] {
  return tenants.map((t) => ({ ...t }));
}

export function findAccount(accountId: string): Account | undefined {
  return accounts.find((a) => a.id === accountId);
}

export function accountsByTenant(tenantId: string): Account[] {
  return accounts.filter((a) => a.tenantId === tenantId).map((a) => ({ ...a }));
}

export function allAccounts(): Account[] {
  return accounts.map((a) => ({ ...a }));
}

export function transactionsByAccount(accountId: string): Transaction[] {
  return transactions.filter((t) => t.accountId === accountId).map((t) => ({ ...t }));
}

// Mutating operation used by the transfer service. Both accounts are passed in already
// ownership-checked by the caller. Debits `from`, credits `to`, records both legs.
export function applyTransfer(fromId: string, toId: string, amount: number): void {
  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  if (!from || !to) {
    throw new Error("applyTransfer called with unknown account id");
  }
  from.balance -= amount;
  to.balance += amount;
  const ts = new Date().toISOString();
  transactions.push({ id: nextTxId(), accountId: from.id, tenantId: from.tenantId, type: "debit", amount, ts, memo: `transfer to ${to.id}` });
  transactions.push({ id: nextTxId(), accountId: to.id, tenantId: to.tenantId, type: "credit", amount, ts, memo: `transfer from ${from.id}` });
}
