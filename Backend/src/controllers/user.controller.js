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
} from "../services/userAuth.service.js";
import { cookieOptions } from "../../config/cookieConfig.config.js";
import AppError from "../utils/AppError.js";
import { findUserById } from "../dao/user.dao.js";

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

    if (!oldPassword || !newPassword) throw new AppError("All fields are required", 400);

    const user = req?.user;

    if (!user) throw new AppError("Unauthorized request", 401);

    await changePasswordService({
        oldPassword,
        newPassword,
        userId: user._id
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
        .json(new AppResponse(200, "User Data fetched successfully", user.toSafeObj()));
})

export const changeProfileAvatar = asyncWrapper(async (req, res) => {
    const avatarPath = req?.file.path;

    const updated = await changeProfileAvatarService(req?.user._id, avatarPath);

    return res.status(200).json(new AppResponse(200, "Avatar updated successfully", updated.toSafeObj()));
});

export const changeCoverImage = asyncWrapper(async (req, res) => {
    const coverPath = req?.file.path;

    const updated = await changeProfileCoverImageService(req?.user._id, coverPath);

    return res.status(200).json(new AppResponse(200, "Cover Image updated successfully", updated.toSafeObj()));
});

export const changeUserDetails = asyncWrapper(async (req, res) => {
    // User can only change it's fullName. 

    const { fullName } = req.body;

    const updated = await changeUserDetailsService(req.user?.id, fullName);

    return res.status(200).json(new AppResponse(200, "Full name updated successfully", updated.toSafeObj()));
})