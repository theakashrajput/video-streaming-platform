import { asyncWrapper } from "../utils/asyncWrapper.js";
import AppResponse from "../utils/AppResponse.js";
import {
    refreshAccessTokenService,
    registerUserService,
    userLoginService,
    userLogoutService,
} from "../services/userAuth.service.js";
import { cookieOptions } from "../../config/cookieConfig.config.js";
import AppError from "../utils/AppError.js";

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
