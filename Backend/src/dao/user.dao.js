import userModel from "../models/user.model.js";

export const createNewUser = async ({
    userName,
    email,
    password,
    fullName,
    avatarRes,
    coverImageRes = null,
}) => {
    const user = await userModel.create({
        userName: userName.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        avatar: avatarRes,
        coverImage: coverImageRes,
    });
    return user;
};

export const findUserById = async (id) => {
    return await userModel.findById(id).select("-password -refreshToken");
};

export const checkUserExist = async ({ userName, email }) => {
    userName = userName.trim().toLowerCase();
    email = email.trim().toLowerCase();
    const user = await userModel.findOne({
        $or: [{ userName }, { email }],
    });
    return user ? true : false;
};
