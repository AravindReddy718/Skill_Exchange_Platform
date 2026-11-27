
import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";
import { getDiscoverMembers } from "./discovery.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("member"));

router.get("/", getDiscoverMembers);

export default router;
