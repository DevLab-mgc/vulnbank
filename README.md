# vulnbank

A tiny **multi-tenant banking API** used as a controlled exploitation target for the Falcon agent.
Express + TypeScript, boots in seconds, small enough to run in a sandbox.

> **This repository is a deliberately vulnerable fixture.** The `main` branch is the safe baseline.
> Vulnerabilities live only on `pr/*-vuln` branches and are intentional (see [REVIEW.md](./REVIEW.md)).
> The tokens below are fake demo credentials, not secrets.

## Run

```bash
npm install
npm start          # listens on http://localhost:3000
```

(`npm start` runs the TypeScript directly via `tsx`; `npm run typecheck` runs `tsc --noEmit`.)

## Seed data

Bearer tokens (send as `Authorization: Bearer <token>`):

| Token | Tenant | Role |
|---|---|---|
| `tenant-a-token` | `tenant-a` | user |
| `tenant-b-token` | `tenant-b` | user |
| `admin-token` | `admin` | admin |

Accounts:

| id | tenant | owner | balance |
|---|---|---|---|
| `acc-a-001` | tenant-a | Alice | 42000 |
| `acc-a-002` | tenant-a | Aaron | 15750 |
| `acc-b-001` | tenant-b | Bob | 88300 |
| `acc-b-002` | tenant-b | Bianca | 2650 |

## Routes (baseline `main`)

| Method | Path | Auth | Behavior |
|---|---|---|---|
| GET | `/health` | none | `{ "ok": true }` |
| GET | `/accounts/:id` | Bearer | returns the account only if it belongs to the caller's tenant, else `403` (missing/invalid token → `401`) |

### Examples

```bash
curl localhost:3000/health
# {"ok":true}

curl -H "Authorization: Bearer tenant-a-token" localhost:3000/accounts/acc-a-001
# {"id":"acc-a-001","tenantId":"tenant-a","owner":"Alice","balance":42000,"currency":"USD"}

curl -H "Authorization: Bearer tenant-a-token" localhost:3000/accounts/acc-b-001
# 403 {"error":"forbidden"}   (cross-tenant access denied)

curl localhost:3000/accounts/acc-a-001
# 401 {"error":"missing or malformed Authorization header"}
```

## Demo branches

- `pr/admin-balances-vuln` — adds `GET /admin/balances` **without** auth → broken access control (EXPLOITED).
- `pr/admin-balances-safe` — adds the same route **with** `authMiddleware` + an admin-role check → CLEAN.
