import chat from "../models/chat.js"
import message from "../models/message.js"
import task from "../models/task.js"
import Notification from "../models/notification.js";
const schat = async (req, res) => {
    const chats = await chat.find({
        users: { $elemMatch: { $eq: req.user._id } }
    })
        .populate('latestMessage');

    const chatIds = chats.map(c => c._id);

    const notifications = await Notification.find({
        user: req.user._id,
        chat: { $in: chatIds }
    });

    const chatsWithNotificationFlag = chats.map(c => {
        const hasNotif = notifications.some(n => n.chat.toString() === c._id.toString());
        return {
            ...c.toObject(),
            hasNotification: hasNotif,
        };
    });

    res.json(chatsWithNotificationFlag);

}

const getchat = async (req, res) => {
    const { chatid, channel } = req.query;
    console.log(chatid, channel);

    try {
        let messages;

        if (channel === 'task') {
            // Fetch tasks related to the chat
            messages = await task.find({ chat: chatid }).populate('to', 'displayName'); // Populate assigned user details
            messages = messages.map(task => ({
                ...task.toObject(),
                type: 'task' // Add type for task messages
            }));
        } else {
            // Fetch messages related to the chat
            messages = await message.find({ chat: chatid });
            messages = messages.map(task => ({
                ...task.toObject(),
                type: 'general' // Add type for task messages
            }));
        }

        const udetails = await chat.findOne({ _id: chatid }).populate('users', '-password');
        console.log(messages, udetails.users);

        const data = {
            cn: udetails.chatName,
            message: messages,
            udetails: udetails.users,
            admin: udetails.groupAdmin
        };

        res.json(data);
    } catch (error) {
        console.error("Error fetching chat data:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const sendMessage = async (req, res) => {
    const { id, messageData } = req.body;

    if (messageData.channel === "task") {
        return res.status(400).json({ error: "Task messages via HTTP not supported yet" });
    }

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

        // 3. Create notifications for all users except sender
        const chatData = await chat.findById(id).populate("users", "_id");

        const recipients = chatData.users.filter(
            (u) => u._id.toString() !== messageData.sender
        );

        for (const recipient of recipients) {
            await Notification.create({
                user: recipient._id,
                from: messageData.sender,
                chat: id,
                message: newMessage._id,
                type: "message",
            });
        }

        // Return the new message so frontend can update UI immediately
        res.json(newMessage);

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
};

export default {
    schat,
    getchat,
    sendMessage
}