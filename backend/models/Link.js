import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },

    analyticsEnabled: {
      type: Boolean,
      default: true,
    },

    clicks: {
      type: Number,
      default: 0,
    },

    passwordProtected: {
      type: Boolean,
      default: false,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    passwordSalt: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.model("Link", linkSchema);

export default Link;