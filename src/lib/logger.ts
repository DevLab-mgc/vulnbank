import { pino } from "pino";
import { config } from "../config.js";

// Structured logger. Authorization headers are redacted so tokens never reach the logs
// (mirrors the ledger/redaction discipline in the wider project).
export const logger = pino({
  level: config.logLevel,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "***REDACTED***",
  },
});
