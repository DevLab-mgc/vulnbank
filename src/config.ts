// Central configuration. No secrets here — the seed tokens live in data/store.ts and are
// deliberately fake demo credentials (see REVIEW.md).
export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  // Body size cap — reject oversized payloads before they reach a handler.
  bodyLimit: "16kb",
  rateLimit: {
    windowMs: 60_000, // 1 minute
    max: 300, // generous; enough for the exploit probes, low enough to blunt abuse
  },
  logLevel: process.env.LOG_LEVEL ?? "info",
} as const;
