import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dotenv } from "../../config/env.config.js";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        fullName: { 
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // Cloudinary Link
            required: true,
        },
        coverImage: {
            type: String, // Cloudinary Link
        },
        refreshToken: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Mongodb Middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    return next();
});

// Custom Methods
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        dotenv.ACCESS_TOKEN_SECRET,
        {
            expiresIn: dotenv.ACCESS_TOKEN_EXPIRES,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        dotenv.REFRESH_TOKEN_SECRET,
        {
            expiresIn: dotenv.REFRESH_TOKEN_EXPIRES,
        }
    );
};

userSchema.methods.toSafeObj = function () {
    const userObject = this.toObject(); // Convert Mongoose Document to plain JS object

    // Remove sensitive fields
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.__v;

    return userObject;
};
const userModel = mongoose.model("User", userSchema);

export default userModel;
