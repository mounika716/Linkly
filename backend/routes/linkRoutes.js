import express from "express";

import {
  createLink,
  getLink,
  verifyPassword,
  getMyLinks,
  deleteMyLink,
  updateMyLink,
  getLinkAnalytics,
} from "../controllers/linkController.js";

import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  optionalAuthMiddleware,
  createLink
);

router.get(
  "/mine",
  authMiddleware,
  getMyLinks
);

router.get(
  "/:code/analytics",
  authMiddleware,
  getLinkAnalytics
);
router.put(
  "/:code",
  authMiddleware,
  updateMyLink
);

router.delete(
  "/:code",
  authMiddleware,
  deleteMyLink
);

router.get(
  "/:code",
  getLink
);

router.post(
  "/:code/verify-password",
  verifyPassword
);

export default router;