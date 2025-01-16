import mongoose from "mongoose"

const chatschema = new mongoose.Schema({
    chatName: { type: String, required: true, trim: true },
    isGroupChat: { type: Boolean, default: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model('Chat',chatschema)