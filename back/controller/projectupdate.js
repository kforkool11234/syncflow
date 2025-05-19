import User from "../models/user.js"
import project from "../models/project.js"
const addtask=async(req,res)=>{
    const {id}=req.params
    console.log(req.body)
    const task=req.body
    try{
        await project.updateOne(
            {_id:id},
            {$push:{timeline:task}}
        )
    }
    catch(error) {
        console.error("Error adding task:", error.message);
        res.status(500).send("Error adding task");
    }
}

const addteam=async(req,res)=>{
    const {id}=req.params
    console.log(req.body)
    const task=req.body
    try{
        await project.updateOne(
            {_id:id},
            {$push:{teamMembers:task}}
        )
        await User.updateOne(
            {username:task.id},
            {$push:{projects:id}}
        )
    }
    catch(error) {
        console.error("Error adding team:", error.message);
        res.status(500).send("Error adding team");
    }
}

const addlink=async(req,res)=>{
    const {id}=req.params
    console.log(req.body)
    const task=req.body
    try{
        await project.updateOne(
            {_id:id},
            {$push:{links:task}}
        )
    }
    catch(error) {
        console.error("Error adding link:", error.message);
        res.status(500).send("Error adding link");
    }
}

const taskdone=async (req, res) => {
    const { id } = req.params; // Project ID
    const { tid, status } = req.body; // Task ID and done status from request body

    try {
        // Update the specific task's 'done' status in the project's timeline
        const result = await project.updateOne(
            { _id: id, "timeline._id": tid }, // Match the project and the task
            { $set: { "timeline.$.done": status } } // Update the specific task's 'done' field
        );

        // Verify the update
        if (result.modifiedCount === 0) {
            return res.status(404).send("Task or Project not found");
        }

        // Optionally fetch the updated project to confirm
        const updatedProject = await project.findOne({ _id: id });
        res.status(200).json(updatedProject); // Return the updated task
    } catch (error) {
        console.error("Error updating task status:", error.message);
        res.status(500).send("Error updating task status");
    }
}

export default{
    addtask,
    addteam,
    addlink,
    taskdone
}