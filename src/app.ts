import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { accountsRouter } from "./routes/accounts.js";
import { transfersRouter } from "./routes/transfers.js";
import { adminRouter } from "./routes/admin.js";

// Assembles the Express app: hardening middleware first, then routers, then the 404 + error
// handlers last. Exported separately from server.ts so it can be built without binding a port.
export function buildApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(pinoHttp({ logger }));
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      limit: config.rateLimit.max,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: config.bodyLimit }));

  app.use(healthRouter);
  app.use(meRouter);
  app.use(accountsRouter);
  app.use(transfersRouter);
  app.use(adminRouter);

  // Order matters: unmatched routes -> 404, then the central error handler.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
