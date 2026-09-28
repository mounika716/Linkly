import mongoose from "mongoose";

const clickEventSchema =
  new mongoose.Schema(
    {
      link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Link",
        required: true,
        index: true,
      },

      referrer: {
        type: String,
        default: "Direct",
        maxlength: 500,
      },

      userAgent: {
        type: String,
        default: "",
        maxlength: 1000,
      },

      device: {
        type: String,
        enum: [
          "desktop",
          "mobile",
          "tablet",
          "unknown",
        ],
        default: "unknown",
      },
    },
    {
      timestamps: true,
    }
  );

clickEventSchema.index({
  link: 1,
  createdAt: -1,
});

const ClickEvent =
  mongoose.model(
    "ClickEvent",
    clickEventSchema
  );

export default ClickEvent;