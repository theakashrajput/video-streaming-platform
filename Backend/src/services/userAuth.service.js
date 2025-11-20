import AppError from "../utils/AppError.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import {
    createNewUser,
    findUser,
    findUserWithoutRemoveProperties,
    updateUser,
} from "../dao/user.dao.js";
import jwt from "jsonwebtoken";
import { dotenv } from "../../config/env.config.js";

// Helper function
const generateTokens = async (userPayload) => {
    try {
        const accessToken = userPayload.generateAccessToken();
        const refreshToken = userPayload.generateRefreshToken();

        const updatedUser = await updateUser({
            id: userPayload._id,
            refreshToken,
        });

        return {
            accessToken,
            refreshToken,
            updatedUser,
        };
    } catch (error) {
        // Only catch here if you want to throw a specific "Token Generation" error
        throw new AppError("Something went wrong while generating tokens", 500);
    }
};

// Service Functions
export const registerUserService = async ({
    userName,
    email,
    password,
    fullName,
    avatar,
    coverImage,
}) => {
    if (!userName || !email || !password || !fullName)
        throw new AppError("All fields are required", 400);
    if (!avatar) throw new AppError("Avatar is required", 400);

    const existingUser = await findUser({ userName, email });

    if (existingUser)
        throw new AppError("User with email or username already exists", 409);

    let avatarRes = await uploadToCloudinary(avatar.path);
    let coverImageRes;
    if (coverImage) {
        coverImageRes = await uploadToCloudinary(coverImage.path);
    }

    const user = await createNewUser({
        userName: userName.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        avatar: avatarRes.secure_url,
        coverImage: coverImageRes?.secure_url,
    });

    const { accessToken, refreshToken, updatedUser } =
        await generateTokens(user);

    return { accessToken, refreshToken, updatedUser };
};

export const userLoginService = async ({ userName, email, password }) => {
    if (!userName && !email)
        throw new AppError("At least one field is required", 400);
    if (!password) throw new AppError("Password is required", 400);

    const user = await findUser({ userName, email });

    if (!user) throw new AppError("Invalid User Credentials", 401);

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) throw new AppError("Invalid user credentials", 401);

    // Pass the user object directly
    const { accessToken, refreshToken, updatedUser } =
        await generateTokens(user);

    return { accessToken, refreshToken, updatedUser };
};

export const userLogoutService = async (userId) => {
    await updateUser({ _id: userId }, { refreshToken: undefined });
    return true;
};

export const refreshAccessTokenService = async (incomingRefreshToken) => {
    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, dotenv.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new AppError("Invalid refresh token", 401);
    }

    const user = await findUserWithoutRemoveProperties(decoded._id);

    if (!user) throw new AppError("Invalid refresh token", 401);

    if (user.refreshToken !== incomingRefreshToken)
        throw new AppError("Refresh token is expired or used", 401);

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    return { newAccessToken, newRefreshToken };
};
