import mongoose from "mongoose";

const taskschema = new mongoose.Schema({
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    due_date: { type: String },
    description: { type: String },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    done: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.task || mongoose.model('task', taskschema);
