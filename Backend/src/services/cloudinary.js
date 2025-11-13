import fs from "fs";
import AppError from "../utils/AppError.js";
import cloudinary from "../../config/cloudinary.config.js";

// Upload Method for Cloudinary upload
export const uploadToCloudinary = async (localFilePath) => {
    if (!localFilePath) throw new AppError("File not provided", 400);

    try {
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log(res);

        try {
            fs.unlinkSync(localFilePath);
        } catch (fileErr) {
            console.error("Failed to delete local file:", fileErr);
        }

        return res;
    } catch (err) {
        console.error(err);
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (_) {}
        throw new AppError("Cloudinary upload failed", 500);
    }
};
