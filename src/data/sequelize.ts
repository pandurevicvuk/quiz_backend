import { config } from "../config/config";
import { Sequelize, Dialect } from "sequelize";

const database = new Sequelize(
  config.database.database!,
  config.database.username!,
  config.database.password!,
  {
    logging: false,
    host: config.database.host!,
    dialect: "postgres" as Dialect,
    port: config.database.port! as unknown as number,
  }
);

export { database };
