import "dotenv/config";

import cors from "cors";
import http from "http";
import express from "express";
import userRouter from "./routes/user-router";
import errorMiddleware from "./middleware/error-middleware";
import healthCheckRouter from "./routes/health-check-router";

import { Logger } from "./utils/logger";
import { initializeSocket } from "./service/game-service";

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
initializeSocket(server);

app.use("/api/health", healthCheckRouter);
app.use("/api/user", userRouter);

app.use(errorMiddleware);
server.listen(process.env.PORT as String, () => {
  Logger.info(`App is listening on port ${process.env.PORT}`);
});
