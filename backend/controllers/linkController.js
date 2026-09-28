import crypto from "crypto";
import Link from "../models/Link.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/authMiddleware.js";
import ClickEvent from "../models/ClickEvent.js";
const CHARACTERS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const EXPIRATION_OPTIONS = {
  never: null,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};
function getDeviceType(userAgent = "") {
  const ua = userAgent.toLowerCase();

  if (
    /ipad|tablet|kindle|playbook/.test(ua)
  ) {
    return "tablet";
  }

  if (
    /mobile|iphone|android|webos|blackberry/.test(
      ua
    )
  ) {
    return "mobile";
  }

  if (ua) {
    return "desktop";
  }

  return "unknown";
}

async function recordClick(
  link,
  req
) {
  if (!link.analyticsEnabled) {
    return;
  }

  const userAgent =
    req.get("user-agent") || "";

  const rawReferrer =
    req.get("referer") || "";

  let referrer = "Direct";

  if (rawReferrer) {
    try {
      referrer =
        new URL(rawReferrer).hostname;
    } catch {
      referrer = "Other";
    }
  }

  link.clicks += 1;

  await link.save();

  try {
    await ClickEvent.create({
      link: link._id,
      referrer,
      userAgent,
      device:
        getDeviceType(userAgent),
    });
  } catch (error) {
    console.error(
      "Click analytics event error:",
      error.message
    );
  }
}
function generateCode(length = 6) {
  const bytes = crypto.randomBytes(length);

  let code = "";

  for (let i = 0; i < length; i++) {
    code += CHARACTERS[bytes[i] % CHARACTERS.length];
  }

  return code;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function isValidAlias(value) {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(value);
}

function hashPassword(password, salt) {
  return crypto
    .scryptSync(password, salt, 64)
    .toString("hex");
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  return {
    salt,
    hash: hashPassword(password, salt),
  };
}

function checkPassword(password, salt, storedHash) {
  if (!salt || !storedHash) {
    return false;
  }

  const hash = hashPassword(password, salt);

  const current = Buffer.from(hash, "hex");
  const stored = Buffer.from(storedHash, "hex");

  if (current.length !== stored.length) {
    return false;
  }

  return crypto.timingSafeEqual(current, stored);
}

function getExpiresAt(expiration) {
  if (!(expiration in EXPIRATION_OPTIONS)) {
    return undefined;
  }

  const duration = EXPIRATION_OPTIONS[expiration];

  if (duration === null) {
    return null;
  }

  return new Date(Date.now() + duration);
}

function isExpired(link) {
  return (
    link.expiresAt &&
    link.expiresAt.getTime() <= Date.now()
  );
}

async function generateUniqueCode() {
  let code;
  let existingLink;

  do {
    code = generateCode(6);
    existingLink = await Link.findOne({ code });
  } while (existingLink);

  return code;
}

export async function createLink(req, res) {
  try {
    const {
      originalUrl,
      analyticsEnabled = true,
      customAliasEnabled = false,
      customAlias = "",
      passwordProtected = false,
      password = "",
      expiration = "never",
    } = req.body;

    // URL validation
    if (!originalUrl || !isValidUrl(originalUrl.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid HTTP or HTTPS URL.",
      });
    }

    // Expiration validation
    const expiresAt = getExpiresAt(expiration);

    if (expiresAt === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiration option.",
      });
    }

    // Alias
    let code;

    if (customAliasEnabled) {
      const alias = customAlias.trim();

      if (!alias) {
        return res.status(400).json({
          success: false,
          message: "Please enter a custom alias.",
        });
      }

      if (!isValidAlias(alias)) {
        return res.status(400).json({
          success: false,
          message:
            "Custom alias must be 3-30 characters and contain only letters, numbers, hyphens, or underscores.",
        });
      }

      const existingAlias = await Link.findOne({
        code: alias,
      });

      if (existingAlias) {
        return res.status(409).json({
          success: false,
          message: "That custom alias is already in use.",
        });
      }

      code = alias;
    } else {
      code = await generateUniqueCode();
    }

    // Password
    let passwordHash = null;
    let passwordSalt = null;

    if (passwordProtected) {
      if (!password || password.length < 4) {
        return res.status(400).json({
          success: false,
          message:
            "Password protection requires at least 4 characters.",
        });
      }

      const passwordData = createPasswordHash(password);

      passwordHash = passwordData.hash;
      passwordSalt = passwordData.salt;
    }

    const link = await Link.create({
  owner: req.user?.id || null,
  code,
  originalUrl: originalUrl.trim(),
  analyticsEnabled,
  passwordProtected,
  passwordHash,
  passwordSalt,
  expiresAt,
});


    const baseUrl =
      process.env.PUBLIC_BASE_URL ||
      `http://localhost:${process.env.PORT || 5000}`;

    const shortUrl = `${baseUrl}/s/${link.code}`;

    return res.status(201).json({
      success: true,
      message: "Short link created successfully.",
      data: {
        code: link.code,
        originalUrl: link.originalUrl,
        shortUrl,
        analyticsEnabled: link.analyticsEnabled,
        passwordProtected: link.passwordProtected,
        expiresAt: link.expiresAt,
        clicks: link.clicks,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error("Create link error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "That short code already exists. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create short link.",
    });
  }
}

export async function getLink(req, res) {
  try {
    const { code } = req.params;

    const link = await Link.findOne({ code });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Short link not found.",
      });
    }
    if (!link.isActive) {
      return res.status(410).json({
        success: false,
        disabled: true,
        message: "This short link has been disabled.",
      });
    }
    if (isExpired(link)) {
      return res.status(410).json({
        success: false,
        expired: true,
        expiresAt: link.expiresAt,
        message: "This short link has expired.",
      });
    }

    if (link.passwordProtected) {
      return res.status(401).json({
        success: false,
        requiresPassword: true,
        expiresAt: link.expiresAt,
        message: "This short link is password protected.",
      });
    }

    await recordClick(link, req);

    return res.json({
      success: true,
      data: {
        code: link.code,
        originalUrl: link.originalUrl,
        clicks: link.clicks,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        passwordProtected: link.passwordProtected,
      },
    });
  } catch (error) {
    console.error("Get link error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve short link.",
    });
  }
}

export async function verifyPassword(req, res) {
  try {
    const { code } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const link = await Link.findOne({ code });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Short link not found.",
      });
    }
    if (!link.isActive) {
        return res.status(410).json({
          success: false,
          disabled: true,
          message: "This short link has been disabled.",
        });
      }

    if (isExpired(link)) {
      return res.status(410).json({
        success: false,
        expired: true,
        expiresAt: link.expiresAt,
        message: "This short link has expired.",
      });
    }

    if (!link.passwordProtected) {
      return res.status(400).json({
        success: false,
        message: "This link is not password protected.",
      });
    }

    const valid = checkPassword(
      password,
      link.passwordSalt,
      link.passwordHash
    );

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

   await recordClick(link, req);

    return res.json({
      success: true,
      data: {
        code: link.code,
        originalUrl: link.originalUrl,
        clicks: link.clicks,
        expiresAt: link.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Password verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify password.",
    });
  }
}
export async function getMyLinks(req, res) {
  try {
    const links = await Link.find({
      owner: req.user.id,
    })
      .select(
        "-passwordHash -passwordSalt"
      )
      .sort({
        createdAt: -1,
      });

    const now = Date.now();

   const formattedLinks = links.map(
  (link) => ({
    id: link._id,
    code: link.code,
    originalUrl: link.originalUrl,
    shortUrl: `${
      process.env.PUBLIC_BASE_URL ||
      "http://localhost:5173"
    }/s/${link.code}`,

    analyticsEnabled:
      link.analyticsEnabled,

    clicks: link.clicks,

    passwordProtected:
      link.passwordProtected,

    expiresAt: link.expiresAt,

    isActive: link.isActive,

    expired:
      link.expiresAt &&
      link.expiresAt.getTime() <= now,

    createdAt: link.createdAt,
  })
);

    return res.json({
      success: true,
      data: {
        links: formattedLinks,
        totalLinks: formattedLinks.length,
        totalClicks: formattedLinks.reduce(
          (total, link) =>
            total + (link.clicks || 0),
          0
        ),
        activeLinks: formattedLinks.filter(
          (link) =>
            !link.expired &&
            link.isActive
        ).length,
      },
    });
  } catch (error) {
    console.error("Get my links error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your links.",
    });
  }
}
export async function deleteMyLink(req, res) {
  try {
    const { code } = req.params;

    const link = await Link.findOneAndDelete({
      code,
      owner: req.user.id,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    return res.json({
      success: true,
      message: "Link deleted successfully.",
    });
  } catch (error) {
    console.error("Delete link error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete link.",
    });
  }
}
export async function updateMyLink(req, res) {
  try {
    const { code } = req.params;

    const {
      originalUrl,
      expiresAt,
      isActive,
    } = req.body;

    const link = await Link.findOne({
      code,
      owner: req.user.id,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    if (
      originalUrl !== undefined
    ) {
      const trimmedUrl =
        String(originalUrl).trim();

      if (!isValidUrl(trimmedUrl)) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid HTTP or HTTPS URL.",
        });
      }

      link.originalUrl = trimmedUrl;
    }

    if (expiresAt !== undefined) {
      if (
        expiresAt === null ||
        expiresAt === ""
      ) {
        link.expiresAt = null;
      } else {
        const date = new Date(expiresAt);

        if (Number.isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid expiration date.",
          });
        }

        link.expiresAt = date;
      }
    }

    if (isActive !== undefined) {
      link.isActive = Boolean(isActive);
    }

    await link.save();

    return res.json({
      success: true,
      message: "Link updated successfully.",
      data: {
        code: link.code,
        originalUrl: link.originalUrl,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        clicks: link.clicks,
      },
    });
  } catch (error) {
    console.error(
      "Update link error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update link.",
    });
  }
}
export async function getLinkAnalytics(
  req,
  res
) {
  try {
    const { code } = req.params;

    const link = await Link.findOne({
      code,
      owner: req.user.id,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    const since = new Date();

    since.setDate(
      since.getDate() - 29
    );

    const daily =
      await ClickEvent.aggregate([
        {
          $match: {
            link: link._id,
            createdAt: {
              $gte: since,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            clicks: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    const referrers =
      await ClickEvent.aggregate([
        {
          $match: {
            link: link._id,
            createdAt: {
              $gte: since,
            },
          },
        },
        {
          $group: {
            _id: "$referrer",
            clicks: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            clicks: -1,
          },
        },
        {
          $limit: 8,
        },
      ]);

    const devices =
      await ClickEvent.aggregate([
        {
          $match: {
            link: link._id,
            createdAt: {
              $gte: since,
            },
          },
        },
        {
          $group: {
            _id: "$device",
            clicks: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            clicks: -1,
          },
        },
      ]);

    return res.json({
      success: true,

      data: {
        code: link.code,

        totalClicks: link.clicks,

        last30Days: daily.map(
          (item) => ({
            date: item._id,
            clicks: item.clicks,
          })
        ),

        referrers: referrers.map(
          (item) => ({
            source:
              item._id || "Direct",
            clicks: item.clicks,
          })
        ),

        devices: devices.map(
          (item) => ({
            device:
              item._id || "unknown",
            clicks: item.clicks,
          })
        ),
      },
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load link analytics.",
    });
  }
}