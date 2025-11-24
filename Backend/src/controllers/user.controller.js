import { asyncWrapper } from "../utils/asyncWrapper.js";
import AppResponse from "../utils/AppResponse.js";
import {
    changePasswordService,
    changeProfileAvatarService,
    changeProfileCoverImageService,
    changeUserDetailsService,
    refreshAccessTokenService,
    registerUserService,
    userLoginService,
    userLogoutService,
} from "../services/user.service.js";
import { cookieOptions } from "../../config/cookieConfig.config.js";
import AppError from "../utils/AppError.js";
import { findUserById } from "../dao/user.dao.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";

export const userRegister = asyncWrapper(async (req, res) => {
    const { userName, email, password, fullName } = req.body;
    const avatar = req.files?.avatar?.[0];
    const coverImage = req.files?.coverImage?.[0];

    const { accessToken, refreshToken, updatedUser } =
        await registerUserService({
            userName,
            email,
            password,
            fullName,
            avatar,
            coverImage,
        });

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new AppResponse(
                201,
                "User created successfully",
                updatedUser.toSafeObj()
            )
        );
});

export const userLogin = asyncWrapper(async (req, res) => {
    const { userName, email, password } = req.body;

    const { accessToken, refreshToken, updatedUser } = await userLoginService({
        userName,
        email,
        password,
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new AppResponse(
                200,
                "User logged in successfully",
                updatedUser.toSafeObj()
            )
        );
});

export const userLogout = asyncWrapper(async (req, res) => {
    const user = req.user;
    if (!user) throw new AppError("Unauthorized request", 401);

    await userLogoutService(user._id);

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new AppResponse(200, "User logged out successfully"));
});

export const refreshAccessToken = asyncWrapper(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) throw new AppError("Unauthorized request", 401);

    const { newAccessToken, newRefreshToken } =
        await refreshAccessTokenService(incomingRefreshToken);

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(new AppResponse(200, "Access token refreshed"));
});

export const changePassword = asyncWrapper(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        throw new AppError("All fields are required", 400);

    const user = req?.user;

    if (!user) throw new AppError("Unauthorized request", 401);

    await changePasswordService({
        oldPassword,
        newPassword,
        userId: user._id,
    });

    return res
        .status(200)
        .json(new AppResponse(200, "Password Changed successfully"));
});

export const getCurrentUser = asyncWrapper(async (req, res) => {
    const userId = req?.user._id;

    const user = await findUserById(userId);

    return res
        .status(200)
        .json(
            new AppResponse(
                200,
                "User Data fetched successfully",
                user.toSafeObj()
            )
        );
});

export const changeProfileAvatar = asyncWrapper(async (req, res) => {
    if (!req.file || !req.file.path) {
        throw new AppError("Avatar image is required", 400);
    }

    const avatarPath = req.file.path;

    const updated = await changeProfileAvatarService(req?.user._id, avatarPath);

    return res
        .status(200)
        .json(
            new AppResponse(
                200,
                "Avatar updated successfully",
                updated.toSafeObj()
            )
        );
});

export const changeCoverImage = asyncWrapper(async (req, res) => {
    if (!req.file || !req.file.path) {
        throw new AppError("Cover image is required", 400);
    }

    const coverPath = req.file.path;

    const updated = await changeProfileCoverImageService(
        req?.user._id,
        coverPath
    );

    return res
        .status(200)
        .json(
            new AppResponse(
                200,
                "Cover Image updated successfully",
                updated.toSafeObj()
            )
        );
});

export const changeUserDetails = asyncWrapper(async (req, res) => {
    // User can only change it's fullName.

    const { fullName } = req.body;

    if (!fullName) throw new AppError("Full name is required", 401);

    const updated = await changeUserDetailsService(req.user?.id, fullName);

    return res
        .status(200)
        .json(
            new AppResponse(
                200,
                "Full name updated successfully",
                updated.toSafeObj()
            )
        );
});

export const getChannelProfile = asyncWrapper(async (req, res) => {
    const userName = req.params.userName;

    if (!userName.trim())
        throw new AppError("Channel not found", 404);

    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(String(req.user._id)) : null;

    const channel = await userModel.aggregate([
        {
            $match: {
                userName: userName.toLowerCase().trim(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed",
            },
        },
        {
            $addFields: {
                channelSubscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedChannelsCount: {
                    $size: "$subscribed"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [currentUserId, null] },
                                { $in: [currentUserId, "$subscribers.subscriber"] }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        }
        ,
        {
            $project: {
                userName: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                channelSubscribersCount: 1,
                channelSubscribedChannelsCount: 1,
                isSubscribed: 1
            }
        }
    ]);

    if (channel.length) throw new AppError("Channel not found", 404);

    return res.status(200).json(new AppResponse(200, "Data fetched successfully", channel[0]));
});
