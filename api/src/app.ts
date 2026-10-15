import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS.split(","), credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/health", healthRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
