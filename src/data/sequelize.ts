import { config } from "../config/config";
import { Sequelize, Dialect } from "sequelize";
import { Logger } from "../utils/logger";

const sequelize = new Sequelize(
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

(async () => {
  await sequelize.sync({ alter: false });

  Logger.info("Database sync completed.");
})();

export { sequelize };
