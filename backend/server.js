import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import linkRoutes from "./routes/linkRoutes.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Allow requests without an Origin header
       * such as health checks/server-to-server calls.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS origin not allowed")
      );
    },
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Linkly backend is running.",
  });
});

app.use(
  "/api/links",
  linkRoutes
);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Linkly API",
  });
});

async function startServer() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Linkly backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "MongoDB connection failed:"
    );

    console.error(error.message);

    process.exit(1);
  }
}

startServer();
