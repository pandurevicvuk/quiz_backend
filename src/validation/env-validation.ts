import { object, string } from "yup";

const envSchema = object().shape({
  port: string().required(
    "Required environment variable 'PORT' is missing in .env file."
  ),
  database: object().shape({
    database: string().required(
      "Required environment variable 'DB_NAME' is missing in .env file."
    ),
    username: string().required(
      "Required environment variable 'DB_USERNAME' is missing in .env file."
    ),
    password: string().required(
      "Required environment variable 'DB_PASSWORD' is missing in .env file."
    ),
    host: string().required(
      "Required environment variable 'DB_HOST' is missing in .env file."
    ),
    port: string().required(
      "Required environment variable 'DB_PORT' is missing in .env file."
    ),
  }),
});

export { envSchema };
