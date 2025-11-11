import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dotenv } from "../config/env.config.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import AppError from "./utils/AppError.js"
import { asyncWrapper } from "./utils/asyncWrapper.js";

const app = express();

// All configurations 
app.use(
  cors({
    origin: dotenv.CORS,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// All Routes


// Error Handler middleware
app.use(errorMiddleware);

export default app;
