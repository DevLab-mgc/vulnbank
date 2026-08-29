// Seed data for the fixture. Hardcoded on purpose — this is a demo target, not a real bank.
// The tokens here are fake demo credentials, not secrets (see REVIEW.md).

export interface Account {
  id: string;
  tenantId: string;
  owner: string;
  balance: number;
  currency: string;
}

export interface TokenIdentity {
  tenantId: string;
  role: "user" | "admin";
}

// Bearer token -> identity. Seed tokens used by the exploit probes.
export const tokens: Record<string, TokenIdentity> = {
  "tenant-a-token": { tenantId: "tenant-a", role: "user" },
  "tenant-b-token": { tenantId: "tenant-b", role: "user" },
  "admin-token": { tenantId: "admin", role: "admin" },
};

// Two tenants, two accounts each.
export const accounts: Account[] = [
  { id: "acc-a-001", tenantId: "tenant-a", owner: "Alice", balance: 42000, currency: "USD" },
  { id: "acc-a-002", tenantId: "tenant-a", owner: "Aaron", balance: 15750, currency: "USD" },
  { id: "acc-b-001", tenantId: "tenant-b", owner: "Bob", balance: 88300, currency: "USD" },
  { id: "acc-b-002", tenantId: "tenant-b", owner: "Bianca", balance: 2650, currency: "USD" },
];
