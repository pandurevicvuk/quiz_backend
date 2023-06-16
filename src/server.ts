import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import healthCheck from "./utils/health-check";

import { Logger } from "./utils/logger";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/healthcheck", async (req: Request, res: Response) => {
  try {
    var dbStatus = await healthCheck.checkDatabaseConnection();
    res.status(200).send({
      serverStatus: "SERVER UP",
      uptime: healthCheck.getUpTime(),
      timestamp: new Date(),
      databaseStatus: dbStatus,
    });
  } catch (error) {
    res.status(503).send();
  }
});

app.listen(process.env.PORT as String, () => {
  Logger.info(`App is listening on port ${process.env.PORT}`);
});
