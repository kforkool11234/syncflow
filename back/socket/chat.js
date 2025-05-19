import message from "../models/message.js";
import chat from "../models/chat.js";
import Notification from "../models/notification.js";

const handlechatevent = (socket, io) => {
  socket.on("sendMessage", async ({ id, messageData }) => {
    if (messageData.channel === "task") return;

    try {
      // 1. Save new message
      const newMessage = new message({
        sender: messageData.sender,
        content: messageData.entry,
        chat: messageData.chat,
        name: messageData.name,
        channel: messageData.channel,
      });

      await newMessage.save();

      // 2. Update latest message in chat
      await chat.findByIdAndUpdate(id, { latestMessage: newMessage._id });

      // 3. Emit new message to all users in chat room
      io.to(id).emit("receiveMessage", newMessage);

      // 4. Create notifications for all users except sender
      const chatData = await chat.findById(id).populate("users", "_id");

      const recipients = chatData.users.filter(
        (u) => u._id.toString() !== messageData.sender
      );

      for (const recipient of recipients) {
        const notif = await Notification.create({
          user: recipient._id,
          from: messageData.sender,
          chat: id,
          message: newMessage._id,
          type: "message",
        });

        // 5. Emit notification to recipient's socket room (assumes you join user rooms)
        io.to(recipient._id.toString()).emit("notification", {
          _id: notif._id,
          from: messageData.sender,
          chat: id,
          message: newMessage._id,
          type: "message",
        });
      }

      console.log("Message sent and notifications created");
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });
};

export default handlechatevent;
