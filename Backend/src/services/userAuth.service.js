import AppError from "../utils/AppError.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import {
    checkUserExist,
    createNewUser,
    findUserById,
} from "../dao/user.dao.js";

export const registerUserService = async ({
    userName,
    email,
    password,
    fullName,
    avatar = null,
    coverImage = null,
}) => {
    if (!userName || !email || !password || !fullName)
        throw new AppError("All fields are required", 400);
    if (!avatar) throw new AppError("Avatar is required", 400);

    const isUserExist = await checkUserExist({ userName, email });

    if (isUserExist)
        throw new AppError("User with email or username already exist", 409);

    let avatarRes = await uploadToCloudinary(avatar.path);
    let coverImageRes;
    if (coverImage) {
        coverImageRes = await uploadToCloudinary(coverImage.path);
    }

    const user = await createNewUser({
        userName,
        email,
        password,
        fullName,
        avatarRes: avatarRes.secure_url,
        coverImageRes: coverImageRes?.secure_url,
    });

    const createdUser = await findUserById(user._id);

    if (!createdUser)
        throw new AppError("Something went wrong while registering user", 500);

    return createdUser;
};
