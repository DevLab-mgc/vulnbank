import { buildApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";

const app = buildApp();

app.listen(config.port, () => {
  logger.info(`vulnbank listening on :${config.port}`);
});
