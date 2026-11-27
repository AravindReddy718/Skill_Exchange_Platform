import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";
import { getOverview } from "./overview.controller.js";

const router = express.Router();

// Protect all overview routes: must be logged in AND have role === "admin"
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/", getOverview);

export default router;
