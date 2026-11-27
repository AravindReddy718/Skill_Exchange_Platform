import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";
import {
  listExchanges,
  forceCancelExchange,
  listSessions,
  forceCancelSession,
} from "./exchanges.controller.js";

const router = express.Router();

// Protect all exchange & session routes: must be logged in AND have role === "admin"
router.use(authMiddleware, roleMiddleware("admin"));

// Sessions (placed before parameterized :exchangeId routes)
router.get("/sessions", listSessions);
router.patch("/sessions/:sessionId/force-cancel", forceCancelSession);

// Exchange requests
router.get("/", listExchanges);
router.patch("/:exchangeId/force-cancel", forceCancelExchange);

export default router;
