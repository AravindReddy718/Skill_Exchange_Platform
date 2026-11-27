
import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";

import {
  getProfile,
  updateProfile,
  updateSkills,
  getAvailableSkillsController,
} from "./profile.controller.js";

const router = express.Router();

// All profile routes require an authenticated member
router.use(authMiddleware);
router.use(roleMiddleware("member"));

// Profile endpoints
router.get("/", getProfile);
router.put("/", updateProfile);

// Skills endpoints
router.get("/skills/available", getAvailableSkillsController);
router.put("/skills", updateSkills);

export default router;
