import "dotenv/config";

import cors from "cors";
import express from "express";
import userRouter from "./routes/user-router";
import errorMiddleware from "./middleware/error-middleware";
import healthCheckRouter from "./routes/health-check-router";

import { Logger } from "./utils/logger";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/health", healthCheckRouter);
app.use("/api/user", userRouter);

app.use(errorMiddleware);
app.listen(process.env.PORT as String, () => {
  Logger.info(`App is listening on port ${process.env.PORT}`);
});
