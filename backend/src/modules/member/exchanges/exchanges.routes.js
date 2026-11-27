
import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";

import {
  sendRequest,
  getSent,
  getReceived,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} from "./exchanges.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("member"));

router.post("/", sendRequest);

router.get("/sent", getSent);
router.get("/received", getReceived);

router.patch("/:requestId/accept", acceptRequest);
router.patch("/:requestId/reject", rejectRequest);
router.patch("/:requestId/cancel", cancelRequest);

export default router;
