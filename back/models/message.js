import mongoose from "mongoose";

const messageschema= new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    channel:{type:String,default:'general'},
    name:{type:String,require:true}
}, { timestamps: true })

export default mongoose.models.Message || mongoose.model('Message',messageschema)