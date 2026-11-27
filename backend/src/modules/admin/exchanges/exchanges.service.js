import mongoose from "mongoose";
import ExchangeRequest from "../../../models/ExchangeRequest.js";
import Session from "../../../models/Session.js";
import "../../../models/User.js";
import "../../../models/Skill.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * List exchange requests with optional status filter and pagination.
 */
export const getExchanges = async ({ status, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const filter = {};
  if (["pending", "accepted", "rejected", "cancelled"].includes(status)) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    ExchangeRequest.find(filter)
      .populate("sender", "name username email")
      .populate("receiver", "name username email")
      .populate("skillOffered", "name category")
      .populate("skillRequested", "name category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    ExchangeRequest.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
};

/**
 * Force-cancel an exchange request and any scheduled sessions linked to it.
 */
export const forceCancelExchangeRequest = async ({ exchangeId }) => {
  if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
    throw createHttpError(400, "Invalid exchange ID.");
  }

  const exchange = await ExchangeRequest.findById(exchangeId);
  if (!exchange) {
    throw createHttpError(404, "Exchange request not found.");
  }

  if (["cancelled", "rejected"].includes(exchange.status)) {
    throw createHttpError(
      400,
      `Exchange request is already ${exchange.status}.`
    );
  }

  exchange.status = "cancelled";
  await exchange.save();

  const sessionResult = await Session.updateMany(
    { exchangeRequest: exchange._id, status: "scheduled" },
    { $set: { status: "cancelled" } }
  );

  await exchange.populate([
    { path: "sender", select: "name username email" },
    { path: "receiver", select: "name username email" },
    { path: "skillOffered", select: "name category" },
    { path: "skillRequested", select: "name category" },
  ]);

  return {
    exchange,
    cancelledSessionsCount: sessionResult.modifiedCount || 0,
  };
};

/**
 * List learning sessions with optional status filter and pagination.
 */
export const getSessions = async ({ status, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const filter = {};
  if (["scheduled", "completed", "cancelled"].includes(status)) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Session.find(filter)
      .populate("organizer", "name username email")
      .populate("participant", "name username email")
      .populate("exchangeRequest", "status skillOffered skillRequested")
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(safeLimit),
    Session.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
};

/**
 * Force-cancel a scheduled session.
 */
export const forceCancelSessionById = async ({ sessionId }) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw createHttpError(400, "Invalid session ID.");
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw createHttpError(404, "Session not found.");
  }

  if (["cancelled", "completed"].includes(session.status)) {
    throw createHttpError(400, `Session is already ${session.status}.`);
  }

  session.status = "cancelled";
  await session.save();

  await session.populate([
    { path: "organizer", select: "name username email" },
    { path: "participant", select: "name username email" },
    { path: "exchangeRequest", select: "status skillOffered skillRequested" },
  ]);

  return session;
};
