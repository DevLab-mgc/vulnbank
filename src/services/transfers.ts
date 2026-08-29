import type { Account } from "../data/store.js";
import { applyTransfer } from "../data/store.js";
import { BadRequestError, UnprocessableEntityError } from "../lib/errors.js";
import { getOwnedAccount } from "./accounts.js";

export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface TransferResult {
  from: Account;
  to: Account;
}

// Moves funds between two accounts that BOTH belong to the caller's tenant. getOwnedAccount is
// the guard: a source or destination in another tenant is rejected (403) before any mutation, so
// there is no cross-tenant transfer path.
export function executeTransfer(tenantId: string, input: TransferInput): TransferResult {
  if (input.fromAccountId === input.toAccountId) {
    throw new BadRequestError("source and destination must differ");
  }

  const from = getOwnedAccount(input.fromAccountId, tenantId);
  getOwnedAccount(input.toAccountId, tenantId);

  if (from.balance < input.amount) {
    throw new UnprocessableEntityError("insufficient funds");
  }

  applyTransfer(input.fromAccountId, input.toAccountId, input.amount);

  return {
    from: getOwnedAccount(input.fromAccountId, tenantId),
    to: getOwnedAccount(input.toAccountId, tenantId),
  };
}
