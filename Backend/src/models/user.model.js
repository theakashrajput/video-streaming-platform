import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dotenv } from "../../config/env.config.js";

const userSchema = new Schema(
  {
    username: {
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
userSchema.method("comparePassword", async function (password) {
  return await bcrypt.compare(password, this.password);
});

userSchema.method("generateAccessToken", function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    dotenv.ACCESS_TOKEN_SECRET,
    {
      expiresIn: dotenv.ACCESS_TOKEN_EXPIRES,
    }
  );
});

userSchema.method("refreshAccessToken", function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    dotenv.REFRESS_TOKEN_SECRET,
    {
      expiresIn: dotenv.REFRESS_TOKEN_EXPIRES,
    }
  );
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
