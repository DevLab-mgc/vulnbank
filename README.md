# vulnbank

A **multi-tenant banking API** used as a controlled exploitation target for the Falcon agent.
Express 5 + TypeScript, hardened on purpose so the baseline has no exploitable access-control
gaps — the *only* intentional flaw lives on a `pr/*-vuln` branch.

> **This repository is a deliberately vulnerable fixture.** The `main` branch is the hardened,
> safe baseline. Vulnerabilities live only on `pr/*-vuln` branches and are intentional
> (see [REVIEW.md](./REVIEW.md)). The tokens below are fake demo credentials, not secrets.

## Run

```bash
npm install
npm start            # tsx src/server.ts -> http://localhost:3000
npm run typecheck    # tsc --noEmit
```

## How it's hardened

- **Authentication** (`middleware/auth.ts`): strict `Bearer` parsing; missing/malformed/unknown
  tokens → `401`, never a `200` with data.
- **Tenant isolation**: every account read goes through one choke point, `getOwnedAccount`
  (`services/accounts.ts`) — cross-tenant access is `403`. There is no data path that skips it.
- **Role enforcement**: everything under `/admin` is chained `authMiddleware` + `requireAdmin`.
- **Input validation** (`middleware/validate.ts`, zod): path params and bodies are schema-checked;
  invalid input → `400` before it reaches a handler.
- **Central error handling** (`middleware/error.ts`): typed `HttpError`s map to status codes; 5xx
  never leak internals or stack traces.
- **Transport hardening** (`app.ts`): `helmet`, rate limiting, JSON body-size cap,
  `x-powered-by` disabled.
- **Log redaction** (`lib/logger.ts`): `Authorization` / `Cookie` headers are redacted.

## Seed data

Bearer tokens (send as `Authorization: Bearer <token>`):

| Token | Tenant | Role |
|---|---|---|
| `tenant-a-token` | `tenant-a` | user |
| `tenant-b-token` | `tenant-b` | user |
| `admin-token` | `tenant-a` | admin |

Accounts: `acc-a-001` (Alice, 42000), `acc-a-002` (Aaron, 15750) in `tenant-a`;
`acc-b-001` (Bob, 88300), `acc-b-002` (Bianca, 2650) in `tenant-b`.

## Routes (baseline `main`)

| Method | Path | Auth | Behavior |
|---|---|---|---|
| GET | `/health` | none | `{ "ok": true }` |
| GET | `/me` | Bearer | the caller's own identity |
| GET | `/accounts` | Bearer | the caller's tenant's accounts only |
| GET | `/accounts/:id` | Bearer | one account, if owned by the caller's tenant (else 403/404) |
| GET | `/accounts/:id/transactions` | Bearer | transactions for an owned account |
| POST | `/transfers` | Bearer | transfer between two accounts the caller's tenant owns |
| GET | `/admin/tenants` | Bearer + admin | all tenants |
| GET | `/admin/accounts` | Bearer + admin | all accounts across tenants |

### Examples

```bash
curl localhost:3000/health
# {"ok":true}

curl -H "Authorization: Bearer tenant-a-token" localhost:3000/accounts/acc-a-001
# {"id":"acc-a-001","tenantId":"tenant-a","owner":"Alice","balance":42000,"currency":"USD"}

curl -H "Authorization: Bearer tenant-a-token" localhost:3000/accounts/acc-b-001
# 403 {"error":"forbidden"}   (cross-tenant denied)

curl -H "Authorization: Bearer tenant-a-token" localhost:3000/admin/accounts
# 403 {"error":"admin role required"}   (non-admin denied)

curl -H "Authorization: Bearer admin-token" localhost:3000/admin/accounts
# 200 { "accounts": [ ...all tenants... ] }
```

## Demo branches (what Falcon scans)

Each adds one new admin endpoint, `GET /admin/balances`, to `routes/admin.ts`:

- `pr/admin-balances-vuln` — added **without** `authMiddleware` + `requireAdmin`, unlike every
  sibling route → broken access control (no token → 200 + all tenants' balances). **EXPLOITED.**
- `pr/admin-balances-safe` — added **with** `authMiddleware` + `requireAdmin`, matching the
  siblings → no token 401, non-admin 403, admin 200. **CLEAN.**
