import mongoose from "mongoose"

// Define Task Schema
const workSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    done:{type: Boolean, default: false }
});

// Define Team Member Schema
const teamMemberSchema = new mongoose.Schema({
    id: { type: String, required: true },
    role: { type: String, required: true }
});
const linkschema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true }
});

// Define Project Schema
const projectSchema = new mongoose.Schema({
    Admin: {type: String, ref: 'user'},
    projectName: { type: String, required: true },
    deadline: { type: Date, required: true },
    githubLink: { type: String },
    description: { type: String, required: true },
    priority: { type: String, required: true },
    timeline: [workSchema], // Array of tasks
    teamMembers: [teamMemberSchema], // Array of team members
    links: [linkschema],
    chat:{type:mongoose.Types.ObjectId, ref:'chat'}
});

// Create Project Model
export const Task=mongoose.models.work || mongoose.model('work', workSchema);
export default mongoose.model.project || mongoose.model('project',projectSchema)
