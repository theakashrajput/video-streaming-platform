import { config } from "dotenv";
config();

export const dotenv = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  CORS: process.env.CORS_ORIGIN,
  NODE_ENV: process.env.NODE_ENV,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
  REFRESS_TOKEN_SECRET: process.env.REFRESS_TOKEN_SECRET,
  REFRESS_TOKEN_EXPIRES: process.env.REFRESS_TOKEN_EXPIRES,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET
};
