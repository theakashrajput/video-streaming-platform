import { dotenv } from "./env.config.js";

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: dotenv.NODE_ENV === "production" ? "none" : "lax",
};
