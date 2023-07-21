import "dotenv/config";
import cors from "cors";
import userRouter from "./routes/user-router";

import errorMiddleware from "./middleware/error-middleware";
import { Logger } from "./utils/logger";
import express, { Request, Response } from "express";
import healthCheckRouter from "./routes/health-check-router";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/health", healthCheckRouter);
app.use("/api/user", userRouter);

app.use(errorMiddleware);
app.listen(process.env.PORT as String, () => {
  Logger.info(`App is listening on port ${process.env.PORT}`);
});
