import fs from "fs";
import AppError from "../utils/AppError.js";
import cloudinary from "../../config/cloudinary.config.js";

// Upload Method for Cloudinary upload
export const uploadToCloudinary = async (localFilePath) => {
    if (!localFilePath) throw new AppError("File not provided", 400);

    try {
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "Video Streaming Platform",
        });

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

export const deleteFromCloudinary = async (publicId) => {
    try {
        const res = await cloudinary.uploader.destroy(publicId);
        return res;
    } catch (error) {
        console.error(
            `Cloudinary deletion failed for publicId: ${publicId}`,
            error.message
        );
    }
};
