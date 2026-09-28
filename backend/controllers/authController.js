import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
function hashPassword(password, salt) {
  return crypto
    .scryptSync(password, salt, 64)
    .toString("hex");
}

function createPasswordCredentials(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  return {
    salt,
    hash: hashPassword(password, salt),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export async function register(req, res) {
  try {
    const name = String(
      req.body.name || ""
    ).trim();

    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body.password || ""
    );

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists.",
      });
    }

    const credentials =
      createPasswordCredentials(password);

    const user = await User.create({
      name,
      email,
      passwordHash: credentials.hash,
      passwordSalt: credentials.salt,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: publicUser(user),
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
}

export async function login(req, res) {
  try {
    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body.password || ""
    );

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordHash = hashPassword(
      password,
      user.passwordSalt
    );

    const currentBuffer = Buffer.from(
      passwordHash,
      "hex"
    );

    const storedBuffer = Buffer.from(
      user.passwordHash,
      "hex"
    );

    const valid =
      currentBuffer.length === storedBuffer.length &&
      crypto.timingSafeEqual(
        currentBuffer,
        storedBuffer
      );

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: publicUser(user),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.json({
      success: true,
      data: {
        user: publicUser(user),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve account.",
    });
  }
}
export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured.",
      });
    }

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google account.",
      });
    }

    const {
      sub,
      email,
      email_verified,
      name,
      picture,
    } = payload;

    if (
      !sub ||
      !email ||
      !email_verified
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Google account verification failed.",
      });
    }

    let user = await User.findOne({
      googleId: sub,
    });

    if (!user) {
      user = await User.findOne({
        email: email.toLowerCase(),
      });
    }

    if (!user) {
      user = await User.create({
        name:
          String(name || "Linkly User").trim(),
        email: email.toLowerCase(),
        avatarUrl: picture || null,
        googleId: sub,
        passwordHash: null,
        passwordSalt: null,
      });
    } else {
      /*
       * Link a verified Google identity to an
       * existing account with the same email.
       */
      if (!user.googleId) {
        user.googleId = sub;
      }

      if (picture) {
        user.avatarUrl = picture;
      }

      if (
        name &&
        user.name !== name
      ) {
        user.name = name;
      }

      await user.save();
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Google login successful.",
      data: {
        token,
        user: publicUser(user),
      },
    });
  } catch (error) {
    console.error(
      "Google login error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Unable to verify your Google account.",
    });
  }
}