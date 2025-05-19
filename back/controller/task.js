import task from "../models/task.js"

const gettask=async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters
    console.log("Fetching tasks for user:", userId);

    try {
        // Fetch tasks assigned to the specified user
        let tasks = await task.find({ to: userId }).populate('chat', 'chatName').populate('to','displayName'); // Populate chat details if needed
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updatetask=async(req,res)=>{
    const{taskId}=req.params
    await task.findByIdAndUpdate(taskId, { done: true }, { new: true });
    console.log("taskUpdated")
    res.sendStatus(200)
}

export default{
    gettask,
    updatetask
}