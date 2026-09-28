import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    passwordSalt: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;