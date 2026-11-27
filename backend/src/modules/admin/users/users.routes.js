import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";
import {
  listUsers,
  updateUserStatus,
  deleteUser,
} from "./users.controller.js";

const router = express.Router();

// Protect all user management routes: must be logged in AND have role === "admin"
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/", listUsers);
router.patch("/:userId/status", updateUserStatus);
router.delete("/:userId", deleteUser);

export default router;
