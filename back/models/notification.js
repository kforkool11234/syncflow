import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  type: { type: String, default: "message" },
  // No 'read' field needed if deleting immediately
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
