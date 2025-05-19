import Notification from "../models/notification.js";

export const deleteNotification = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  try {
    const result = await Notification.deleteMany({ chat: chatId, user: userId });

    res.json({
      message: `Deleted ${result.deletedCount} notifications for user ${userId} in chat ${chatId}`,
    });
  } catch (error) {
    console.error("Error deleting chat notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};
