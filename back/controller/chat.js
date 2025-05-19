import chat from "../models/chat.js"
import message from "../models/message.js"
import task from "../models/task.js"
import Notification from "../models/notification.js";
const schat=async(req,res)=>{
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

const getchat=async (req, res) => {
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

export default{
    schat,
    getchat
}