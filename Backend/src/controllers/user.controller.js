import { asyncWrapper } from "../utils/asyncWrapper.js";
import AppResponse from "../utils/AppResponse.js";
import { registerUserService } from "../services/userAuth.service.js";

export const userRegister = asyncWrapper(async (req, res) => {
    const { userName, email, password, fullName } = req.body;
    const avatar = req.files?.avatar?.[0];
    const coverImage = req.files?.coverImage?.[0];

    const newUser = await registerUserService({
        userName,
        email,
        password,
        fullName,
        avatar,
        coverImage,
    });

    return res
        .status(201)
        .json(new AppResponse(201, "User created successfully", newUser));
});
