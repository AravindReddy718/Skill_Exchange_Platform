
import mongoose from "mongoose";
import ExchangeRequest from "../../../models/ExchangeRequest.js";
import User from "../../../models/User.js";
import Skill from "../../../models/Skill.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createExchangeRequest = async (senderId, requestData) => {
  const {
    receiver,
    skillOffered,
    skillRequested,
    message = "",
  } = requestData;

  if (!receiver || !skillOffered || !skillRequested) {
    throw createError(
      "Receiver, offered skill, and requested skill are required"
    );
  }

  if (
    !mongoose.isValidObjectId(receiver) ||
    !mongoose.isValidObjectId(skillOffered) ||
    !mongoose.isValidObjectId(skillRequested)
  ) {
    throw createError("Invalid user or skill ID");
  }

  if (senderId.toString() === receiver.toString()) {
    throw createError("You cannot send an exchange request to yourself");
  }

  if (typeof message !== "string" || message.length > 500) {
    throw createError("Message must be a string of at most 500 characters");
  }

  const recipient = await User.findOne({
    _id: receiver,
    role: "member",
    isSuspended: false,
  });

  if (!recipient) {
    throw createError("Recipient not found or unavailable", 404);
  }

  const sender = await User.findOne({
    _id: senderId,
    role: "member",
    isSuspended: false,
  });

  if (!sender) {
    throw createError("Sender not found or unavailable", 404);
  }

  const [offeredSkill, requestedSkill] = await Promise.all([
    Skill.findOne({ _id: skillOffered, isActive: true }),
    Skill.findOne({ _id: skillRequested, isActive: true }),
  ]);

  if (!offeredSkill || !requestedSkill) {
    throw createError("One or more skills are invalid or inactive");
  }

  const senderOffersSkill = sender.skillsOffered.some(
    (item) => item.skill.toString() === skillOffered.toString()
  );

  const receiverOffersSkill = recipient.skillsOffered.some(
    (item) => item.skill.toString() === skillRequested.toString()
  );

  if (!senderOffersSkill) {
    throw createError("You do not offer the selected skill");
  }

  if (!receiverOffersSkill) {
    throw createError("The recipient does not offer the requested skill");
  }

  const existingRequest = await ExchangeRequest.findOne({
    sender: senderId,
    receiver,
    skillOffered,
    skillRequested,
    status: { $in: ["pending", "accepted"] },
  });

  if (existingRequest) {
    throw createError("An active request for this skill exchange already exists", 409);
  }

  return ExchangeRequest.create({
    sender: senderId,
    receiver,
    skillOffered,
    skillRequested,
    message: message.trim(),
  });
};

export const getSentRequests = async (userId) => {
  return ExchangeRequest.find({ sender: userId })
    .populate("receiver", "name username profilePicture")
    .populate("skillOffered", "name category")
    .populate("skillRequested", "name category")
    .sort({ createdAt: -1 });
};

export const getReceivedRequests = async (userId) => {
  return ExchangeRequest.find({ receiver: userId })
    .populate("sender", "name username profilePicture")
    .populate("skillOffered", "name category")
    .populate("skillRequested", "name category")
    .sort({ createdAt: -1 });
};

const updateRequestStatus = async (requestId, userId, allowedStatuses, newStatus) => {
  if (!mongoose.isValidObjectId(requestId)) {
    throw createError("Invalid exchange request ID");
  }

  const request = await ExchangeRequest.findById(requestId);

  if (!request) {
    throw createError("Exchange request not found", 404);
  }

  if (!allowedStatuses.includes(request.status)) {
    throw createError(
      `Cannot change request status from ${request.status}`
    );
  }

  const isSender = request.sender.toString() === userId.toString();
  const isReceiver = request.receiver.toString() === userId.toString();

  if (
    (newStatus === "cancelled" && !isSender) ||
    (["accepted", "rejected"].includes(newStatus) && !isReceiver)
  ) {
    throw createError("You are not authorized to perform this action", 403);
  }

  request.status = newStatus;
  await request.save();

  return request;
};

export const acceptExchangeRequest = async (requestId, userId) => {
  return updateRequestStatus(requestId, userId, ["pending"], "accepted");
};

export const rejectExchangeRequest = async (requestId, userId) => {
  return updateRequestStatus(requestId, userId, ["pending"], "rejected");
};

export const cancelExchangeRequest = async (requestId, userId) => {
  return updateRequestStatus(requestId, userId, ["pending"], "cancelled");
};
