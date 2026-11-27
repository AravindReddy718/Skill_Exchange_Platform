import mongoose from "mongoose";
import Verification from "../../../models/Verification.js";
import User from "../../../models/User.js";
import "../../../models/Skill.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * List verification requests with optional status filter and pagination.
 */
export const getVerifications = async ({ status, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const filter = {};
  if (["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Verification.find(filter)
      .populate("user", "name username email profilePicture isVerified")
      .populate("skill", "name category")
      .populate("reviewedBy", "name username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Verification.countDocuments(filter),
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
 * Approve or reject a verification request and grant verified badge on approval.
 */
export const reviewVerificationRequest = async ({
  verificationId,
  status,
  rejectionReason = "",
  currentAdminId,
}) => {
  if (!mongoose.Types.ObjectId.isValid(verificationId)) {
    throw createHttpError(400, "Invalid verification ID.");
  }

  if (!["approved", "rejected"].includes(status)) {
    throw createHttpError(400, "Status must be 'approved' or 'rejected'.");
  }

  if (status === "rejected" && (!rejectionReason || !String(rejectionReason).trim())) {
    throw createHttpError(400, "A rejection reason is required when rejecting.");
  }

  const verification = await Verification.findById(verificationId);
  if (!verification) {
    throw createHttpError(404, "Verification request not found.");
  }

  if (verification.status !== "pending") {
    throw createHttpError(
      400,
      `Verification request has already been ${verification.status}.`
    );
  }

  verification.status = status;
  verification.reviewedBy = currentAdminId;
  verification.reviewedAt = new Date();
  verification.rejectionReason =
    status === "rejected" ? String(rejectionReason).trim() : "";

  await verification.save();

  if (status === "approved") {
    await User.findByIdAndUpdate(verification.user, { isVerified: true });
  }

  await verification.populate([
    { path: "user", select: "name username email profilePicture isVerified" },
    { path: "skill", select: "name category" },
    { path: "reviewedBy", select: "name username" },
  ]);

  return verification;
};
