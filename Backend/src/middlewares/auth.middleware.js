import { dotenv } from "../../config/env.config.js";
import AppError from "../utils/AppError.js"
import jwt from "jsonwebtoken";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { findUserById } from "../dao/user.dao.js";

export const verifyJWT = asyncWrapper(async (req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new AppError("Unauthorized request", 401);
    try {
        const decoded = jwt.verify(token, dotenv.ACCESS_TOKEN_SECRET);

        const user = await findUserById(decoded._id);
        
        if (!user) throw new AppError("Invalid access token", 401);

        req.user = user;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") throw new AppError("Access token expired", 401);
        throw new AppError("Invalid access token", 401);
    }
});