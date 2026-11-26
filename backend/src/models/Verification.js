
import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    certificateName: {
      type: String,
      required: true,
      trim: true,
    },

    issuingOrganization: {
      type: String,
      required: true,
      trim: true,
    },

    certificateUrl: {
      type: String,
      required: true,
      trim: true,
    },

    issueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Indexes for Member and Admin queries
verificationSchema.index({ user: 1, createdAt: -1 });
verificationSchema.index({ status: 1, createdAt: -1 });

const Verification = mongoose.model(
  "Verification",
  verificationSchema
);

export default Verification;
