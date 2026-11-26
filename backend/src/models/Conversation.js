
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "resource"],
      default: "text",
    },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRequest",
      required: true,
      unique: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [messageSchema],
  },
  { timestamps: true }
);

// Retrieve conversations for a particular user
conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;
