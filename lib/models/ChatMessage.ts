import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
    sessionId: String,
    sender: String, // "user" | "bot" | "agent"
    message: String, // Changed from 'text' to 'message' for consistency
    text: String, // Keep for backward compatibility
    at: Date, // Add explicit at field for compatibility
  },
  { timestamps: true, collection: "chatmessages" }
);

export default mongoose.models.ChatMessage ?? mongoose.model("ChatMessage", ChatMessageSchema);