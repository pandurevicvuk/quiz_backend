import "dotenv/config";
import cors from "cors";
import express from "express";

import { Logger } from "./utils/logger";

const app = express();
app.use(express.json());
app.use(cors());

app.listen(process.env.PORT as String, () => {
  Logger.info(`App is listening on port ${process.env.PORT}`);
});
