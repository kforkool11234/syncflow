import express from "express"
import bodyParser from "body-parser"
import axios from "axios"
import mongoose from "mongoose"
import Cors from "cors"
import dotenv from "dotenv"
import User from "./models/user.js"
import project from "./models/project.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import chat from "./models/chat.js"
import message from "./models/message.js"
import task from "./models/task.js"
import http from "http"
import { Server } from "socket.io"
const app=express()
app.use(bodyParser.json())
app.use(Cors())
dotenv.config()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // React app URL
      pingTimeout: 30000
    },
  });
//connect
mongoose.connect(process.env.mongo)
.then(()=>{
    console.log("mongo connected")
})
.catch((err)=>{console.log("error connecting: ",err)})
//middleware
const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.sendStatus(403); // Forbidden
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', async (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        
        const foundUser = await User.findOne({ username: user.id });
        if (!foundUser) {
            return res.sendStatus(404); // Not Found
        }

        req.user = foundUser; // Attach user info to request
        next(); // Proceed to next middleware or route handler
    });
};
const adminOnly= async(req,res,next)=>{
    const {id}=req.params
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.sendStatus(403); // Forbidden
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', async (err,user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        
        const foundpro = await project.findOne({ _id:id});
        if (!foundpro) {
            return res.sendStatus(404); // Not Found
        }
        else if(foundpro.Admin===user.id){
            req.admin=true;
            next();
        }else{
            return res.sendStatus(403); // Forbidden
        }
    });
}
//routes
app.post('/signup', async (req, res) => {
    const { username, password, displayName } = req.body;
    try {
        console.log(password)
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, displayName });
        await newUser.save();
        res.status(201).send("User created successfully!");
    } catch (error) {
        res.status(500).send("Error creating user: " + error.message);
        console.log(error.message)
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`Login attempt with non-existent user: ${username}`);
            return res.status(400).send("User not found");
        }

        console.log(`User found: ${username}`);
        console.log("Input Password:", password);
        console.log("Stored Hash:", user.password);

        // Trim and compare passwords
        const trimmedPassword = password.trim();
        const isMatch = await bcrypt.compare(trimmedPassword, user.password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            return res.status(400).send("Invalid credentials");
        }

        const token = jwt.sign({ id: user.username,_id:user._id, dn:user.displayName }, 'your_jwt_secret', { expiresIn: '72h' });
        res.json({ token });
    } catch (error) {
        console.error("Error logging in:", error.message);
        res.status(500).send("Error logging in: " + error.message);
    }
});


app.post("/createproject",authenticateJWT,async(req,res)=>{
    const{basicInfo,timeline,members,Admin}=req.body
    console.log(req.body)
    console.log(basicInfo,timeline,members,Admin)
    var teamid=[]
    for (const member of members) {
        const userExists = await User.findOne({ username: member.id });
        teamid.push(userExists._id)
        if (!userExists) {
            return res.status(400).send(`The user '${member}' does not exist.`);
        }
        console.log("user exist")
    }
    const adminUser = await User.findOne({ username: Admin });
    const newpro= new project({
            Admin,
            projectName: basicInfo.projectName,
            deadline: basicInfo.deadline,
            githubLink:basicInfo.githubLink,
            description:basicInfo.description,
            priority:basicInfo.priority,
            timeline,
            teamMembers: [{ id: Admin, role: 'lead' }, ...members]})
    await newpro.save()
    await User.updateOne(
        {username:Admin},
        {$addToSet:{projects:newpro._id}}
    )
    const memberUsernames = members.map(member => member.id);
    await User.updateMany(
        {username:{$in:memberUsernames}},
        {$addToSet:{projects:newpro._id}}
    )
    const newchat=new chat({
        chatName:basicInfo.projectName,
        users:[adminUser._id,...teamid],
        groupAdmin:adminUser._id
    })
    await newchat.save()
    res.status(201).send("Project created successfully!");
})

app.get("/project",authenticateJWT,async(req,res)=>{
    const user= await User.findOne({ username:req.user.username }).populate('projects','-password')
    console.log("user:" ,user)
    const projects = await project.find({ _id: { $in: user.projects } });
    console.log(projects)
    res.json(projects)
})
app.get("/pinfo",async(req,res)=>{
    const {projecid}=req.query
    const projectinfo= await project.findOne({ _id:projecid })
    console.log(projectinfo)
    res.json(projectinfo)
})
app.patch('/project/addtask/:id',adminOnly,async(req,res)=>{
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
})
app.patch('/project/addteam/:id',adminOnly,async(req,res)=>{
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
        console.error("Error adding task:", error.message);
        res.status(500).send("Error adding task");
    }
})
app.patch('/project/addlink/:id',adminOnly,async(req,res)=>{
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
        console.error("Error adding task:", error.message);
        res.status(500).send("Error adding task");
    }
})
app.patch('/project/taskdone/:id', async (req, res) => {
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
});
app.get('/chat',authenticateJWT,async(req,res)=>{
    var isChat = await chat.find({
          users: { $elemMatch: { $eq: req.user._id } } 
      }).populate('latestMessage')
        console.log(isChat,req.user._id)
    res.json(isChat)
})
app.get('/chat/getchat', async (req, res) => {
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
});
app.get('/task/gettask', async (req, res) => {
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
});
app.patch('/task/updatetask/:taskId',async(req,res)=>{
    const{taskId}=req.params
    await task.findByIdAndUpdate(taskId, { done: true }, { new: true });
    console.log("taskUpdated")
    res.sendStatus(200)
})
app.get('/getCalendarData', async (req, res) => {
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
});


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    // Join a room
    socket.on('join', (id) => {
        socket.join(id);
        console.log(`User ${socket.id} joined room: ${id}`);
    });
  
    // Handle sending messages or creating tasks
    socket.on('sendMessage', async ({ id, messageData }) => {
        try {
            if (messageData.channel === 'task') {
                console.log('here')
                // Create a new task
                const newTask = new task({
                    to: messageData.assignedTo,
                    due_date: messageData.dueDate,
                    description: messageData.entry,
                    chat: messageData.chat,
                });
                await newTask.save();
                const n= await task.findOne({_id:newTask.id}).populate('to','displayName')
                // Notify general channel about the assigned task
                const notificationMessage = `${messageData.name} has assigned a new task to ${n.to.displayName}.`;
                const newMessage = new message({
                    sender: messageData.sender,
                    content: notificationMessage,
                    chat: messageData.chat,
                    name: messageData.name,
                    channel: 'general',
                });

                await newMessage.save();

                io.to(id).emit('receiveMessage', newMessage);

                // Emit the task details to the specific chat room
                io.to(id).emit('receiveTask', newTask);
            } else {
                // Handle regular messages
                const newmes = new message({
                    sender: messageData.sender,
                    content: messageData.entry,
                    chat: messageData.chat,
                    name: messageData.name,
                    channel: messageData.channel,
                });

                await newmes.save();
                io.to(id).emit('receiveMessage', newmes);
                await chat.findByIdAndUpdate(id,{latestMessage:newmes._id})
                console.log('done')
            }
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle marking a task as done
    socket.on('markTaskAsDone', async ({ taskId }) => {
        try {
            const updatedTask = await task.findByIdAndUpdate(taskId, { done: true }, { new: true }).populate('to','displayName');

            if (updatedTask) {
                const completionMessage = `${updatedTask.description} has been marked as completed by ${updatedTask.to.displayName}.`;
                
                const completionNotification = new message({
                    sender: updatedTask.to._id, // Assuming this is the user who marked it done
                    content: completionMessage,
                    chat: updatedTask.chat,
                    name: updatedTask.to.displayName, // You may want to replace this with actual user name
                    channel: 'general',
                });

                await completionNotification.save();
                io.to(id).emit('receiveMessage', completionNotification);
                
                // Emit updated task details back to the specific chat room if needed
                io.to(updatedTask.chat).emit('taskUpdated', updatedTask);
            }
        } catch (error) {
            console.error("Error marking task as done:", error);
            socket.emit('error', { message: 'Failed to mark task as done' });
        }
    });
});
  
server.listen(5000,(req,res)=>{
    console.log("sever running on port 5000")
})