import jwt from "jsonwebtoken";

function getToken(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7).trim();
}

export function authMiddleware(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is not configured.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

/*
 * Anonymous users are allowed.
 * If a token exists, it must be valid.
 */
export function optionalAuthMiddleware(
  req,
  res,
  next
) {
  try {
    const token = getToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is not configured.",
      });
    }

    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}