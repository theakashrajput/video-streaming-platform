import { config } from "dotenv";
config();

export const dotenv = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  CORS: process.env.CORS_ORIGIN,
  NODE_ENV: process.env.NODE_ENV,
};
