import userModel from "../models/user.model.js";

export const createNewUser = async (userData) => {
    // Ensure userData keys match your schema (userName, email, etc.)
    return await userModel.create(userData);
};

export const findUserById = async (id) => {
    return await userModel.findById(id).select("-password -refreshToken");
};

export const findUser = async ({ userName, email }) => {
    userName = userName.trim().toLowerCase();
    email = email.trim().toLowerCase();
    
    return await userModel.findOne({
        $or: [{ userName }, { email }],
    });
};

export const updateUser = async ({ id, refreshToken }) => {
    return await userModel.findOneAndUpdate(
        { _id: id },
        { refreshToken },
        {
            new: true,
            runValidators: true
        }
    );
}