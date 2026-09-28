import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import linkRoutes from "./routes/linkRoutes.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  "https://linkly-tan.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests and approved browser origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Do not turn a CORS rejection into an HTTP 500.
      return callback(null, false);
    },

    methods: [
      "GET",
      "HEAD",
      "PUT",
      "PATCH",
      "POST",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,

    optionsSuccessStatus: 204,
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
