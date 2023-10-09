import dotenv from "dotenv";
dotenv.config();

import { envSchema } from "../validation/env-validation";

const config = {
  port: process.env.PORT,
  database: {
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
  },
};

envSchema.validate(config, { abortEarly: false });

export { config };
