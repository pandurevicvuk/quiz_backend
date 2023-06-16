import fs from "fs";
import path from "path";
import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";

const logDir: string = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "white",
};

// Define log format
const logFormat = winston.format.printf(
  ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
);

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    new winstonDaily({
      level: "debug",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/debug",
      filename: `%DATE%.log`,
      maxFiles: 30,
      json: false,
      zippedArchive: true,
    }),
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error",
      filename: `%DATE%.log`,
      maxFiles: 30,
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.colorize({ all: true, colors })
    ),
  })
);

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf("\n")));
  },
};

export { logger as Logger, stream };
