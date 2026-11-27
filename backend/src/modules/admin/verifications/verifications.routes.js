import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";
import {
    listVerifications,
    reviewVerification,
} from "./verifications.controller.js";

const router = express.Router();


router.use(authMiddleware, roleMiddleware("admin"));

router.get("/", listVerifications);
router.patch("/:verificationId", reviewVerification);

export default router;
