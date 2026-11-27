import mongoose from "mongoose";
import User from "../../../models/User.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * List and search registered accounts with optional status/role filters and pagination.
 */
export const getAllUsers = async ({ search, status, role, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (search && typeof search === "string" && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
  }

  if (status === "suspended") {
    filter.isSuspended = true;
  } else if (status === "active") {
    filter.isSuspended = false;
  }

  if (role === "member" || role === "admin") {
    filter.role = role;
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    User.countDocuments(filter),
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
 * Suspend or unsuspend a user account.
 */
export const setUserSuspension = async ({ userId, isSuspended, currentAdminId }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(400, "Invalid user ID.");
  }

  if (typeof isSuspended !== "boolean") {
    throw createHttpError(400, "isSuspended must be a boolean.");
  }

  if (userId === String(currentAdminId)) {
    throw createHttpError(400, "You cannot change your own suspension status.");
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  if (user.role === "admin") {
    throw createHttpError(403, "Admin accounts cannot be suspended.");
  }

  user.isSuspended = isSuspended;
  await user.save();

  return user;
};

/**
 * Permanently delete a user account.
 */
export const removeUser = async ({ userId, currentAdminId }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(400, "Invalid user ID.");
  }

  if (userId === String(currentAdminId)) {
    throw createHttpError(400, "You cannot delete your own account.");
  }

  const user = await User.findById(userId).select("_id role");
  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  if (user.role === "admin") {
    throw createHttpError(403, "Admin accounts cannot be deleted.");
  }

  await User.findByIdAndDelete(userId);
};
