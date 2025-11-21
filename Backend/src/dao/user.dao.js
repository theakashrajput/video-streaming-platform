import userModel from "../models/user.model.js";

export const createNewUser = async (userData) => {
    // Ensure userData keys match your schema (userName, email, etc.)
    return await userModel.create(userData);
};

export const findUserById = async (id) => {
    return await userModel.findById(id).select("-password -refreshToken");
};

export const findUserWithoutRemoveProperties = async (id) => {
    return await userModel.findById(id);
};

export const findUser = async ({ userName, email }) => {
    return await userModel.findOne({
        $or: [{ userName }, { email }],
    });
};

export const updateUser = async (id, payload) => {
    return await userModel.findOneAndUpdate(
        { _id: id },
        { $set: payload },
        {
            new: true,
            runValidators: true,
        }
    );
};
