import { dotenv } from "../../config/env.config.js";

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || "error",
    message: err.message || "Internal server error",
    stack: dotenv.NODE_ENV === "devlopment" ? err.stack : undefined,
  });
};
