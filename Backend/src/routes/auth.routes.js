import { Router } from "express";
import {
    changeCoverImage,
    changePassword,
    changeProfileAvatar,
    getChannelProfile,
    getWatchHistory,
    refreshAccessToken,
    userLogin,
    userLogout,
    userRegister,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    userRegister
);

// Public Routes
router.route("/login").post(userLogin);
router.route("/refresh-token").post(refreshAccessToken);

// Protected Routes
router.route("/logout").post(verifyJWT, userLogout);
router.route("/change-password").post(verifyJWT, changePassword);
router
    .route("/change-avatar")
    .post(upload.single("avatar"), verifyJWT, changeProfileAvatar);
router
    .route("/change-coverImage")
    .post(upload.single("coverImage"), verifyJWT, changeCoverImage);

router.route("/c/:userName").get(verifyJWT, getChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
