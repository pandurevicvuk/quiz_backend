import "dotenv/config";
import cors from "cors";
import http from "http";
import express from "express";
import errorMiddleware from "./middleware/error-middleware";

import { Logger } from "./utils/logger";
import { config } from "./config/config";
import { sequelize } from "./data/sequelize";
import { initializeSocket } from "./service/socket-service";

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
initializeSocket(server);

app.use("/", async (req, res, next) => {
  try {
    res.status(200).json("SERVER IS UP!");
  } catch (error) {
    next(error);
  }
});

app.use(errorMiddleware);

server.listen(config.port, async () => {
  // await sequelize.sync({ alter: true });
  Logger.info(`Database synchronized.`);
  Logger.info(`App is listening on port ${config.port}`);
});
