import AppError from "../utils/AppError.js";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary.js";
import {
    createNewUser,
    findUser,
    findUserById,
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

        const updatedUser = await updateUser(userPayload._id, { refreshToken });

        return {
            accessToken,
            refreshToken,
            updatedUser,
        };
    } catch (error) {
        throw new AppError("Something went wrong while generating tokens", 500);
    }
};

export const getPublicIdFromUrl = (url) => {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;

    const match = url.match(regex);

    return match ? decodeURIComponent(match[1]) : null;
};

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

    const { accessToken, refreshToken, updatedUser } =
        await generateTokens(user);

    return { accessToken, refreshToken, updatedUser };
};

export const userLogoutService = async (userId) => {
    await updateUser(userId, { refreshToken: undefined });
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

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateTokens(user);

    return { newAccessToken, newRefreshToken };
};

export const changePasswordService = async ({
    oldPassword,
    newPassword,
    userId,
}) => {
    const user = await findUserWithoutRemoveProperties(userId);

    if (!user) throw new AppError("User not found", 404);

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) throw new AppError("Invalid old Password", 401);

    user.password = newPassword;

    await user.save();

    return true;
};

export const changeProfileAvatarService = async (userId, avatarLocalPath) => {
    const user = await findUserById(userId);

    if (!user) throw new AppError("Invalid user credentials", 401);

    const oldImageUrl = user.avatar;

    const avatarUrl = await uploadToCloudinary(avatarLocalPath);

    const updatedUser = await updateUser(userId, {
        avatar: avatarUrl.secure_url,
    });

    if (oldImageUrl) {
        const publicId = getPublicIdFromUrl(oldImageUrl);
        if (publicId) {
            deleteFromCloudinary(publicId).catch((err) =>
                console.log("Background delete failed", err)
            );
        } else {
            console.log("Could not extract public ID");
        }
    }

    return updatedUser;
};

export const changeProfileCoverImageService = async (
    userId,
    coverImageLocalPath
) => {
    const user = await findUserById(userId);

    if (!user) throw new AppError("Invalid user credentials", 401);

    const oldImageUrl = user.avatar;

    const coverImageUrl = await uploadToCloudinary(coverImageLocalPath);

    const updatedUser = updateUser(userId, {
        coverImage: coverImageUrl.secure_url,
    });

    if (oldImageUrl) {
        const publicId = getPublicIdFromUrl(oldImageUrl);
        if (publicId) {
            deleteFromCloudinary(publicId).catch((err) =>
                console.log("Background delete failed", err)
            );
        } else {
            console.log("Could not extract public ID");
        }
    }

    return updatedUser;
};

export const changeUserDetailsService = async (userId, fullName) => {
    fullName = fullName.trim();

    const updatedUser = await updateUser(userId, { fullName });

    return updateUser;
};

// https://res.cloudinary.com/dcpenybwr/image/upload/v1763728001/Video%20Streaming%20Platform/n8aai9yncknarebpzgns.jpg
