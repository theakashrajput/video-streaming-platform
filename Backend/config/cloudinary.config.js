import { dotenv } from "./env.config.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: dotenv.CLOUD_NAME,
    api_key: dotenv.API_KEY,
    api_secret: dotenv.API_SECRET
});

export default cloudinary;