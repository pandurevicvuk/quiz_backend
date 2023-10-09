import "dotenv/config";

import cors from "cors";
import http from "http";
import express from "express";
import errorMiddleware from "./middleware/error-middleware";

import { Logger } from "./utils/logger";
import { initializeSocket } from "./service/socket-service";

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
initializeSocket(server);

app.use("/", (req, res, next) => {
  res.status(200).send("SERVER IS UP!");
});

app.use(errorMiddleware);
server.listen(process.env.PORT as String, () => {
  Logger.info(`App is listening on port ${process.env.PORT}`);
});
