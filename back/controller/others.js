import User from "../models/user.js"
import project from "../models/project.js"
import task from "../models/task.js"

const getcalender=async (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters

    console.log("Fetching calendar data for user:", userId);

    try {
        // Fetch tasks assigned to the specified user
        const tasks = await task.find({ to: userId }).populate('to', 'displayName');

        // Fetch projects where the user is a team member
        const user= await User.findOne({ _id:userId }).populate('projects','-password')
    const projects = await project.find({ _id: { $in: user.projects } });
    console.log(projects)
        // Format tasks for calendar display
        const formattedTasks = tasks.map(task => ({
            id: task._id,
            title: task.description,
            start: new Date(task.due_date), // Assuming due_date is in a valid date format
            end: new Date(task.due_date), // End date is the same as start date for single-day events
            type: 'task',
            assignedTo: task.to.displayName,
            done: task.done,
        }));

        // Format projects for calendar display
        const formattedProjects = projects.map(project => ({
            id: project._id,
            title: project.projectName, // Assuming you have a name field in your Project model
            end: new Date(project.deadline), // End date is the same as start date for single-day events
            type: 'project',
        }));

        // Combine tasks and projects into one array
        const allEvents = [...formattedTasks, ...formattedProjects];

        res.json(allEvents);
    } catch (error) {
        console.error("Error fetching calendar data:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export default{
    getcalender
}