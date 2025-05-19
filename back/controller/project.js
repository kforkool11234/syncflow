import User from "../models/user.js"
import chat from "../models/chat.js"
import project from "../models/project.js"

const createproject=async(req,res)=>{
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
    newpro.chat = newchat._id;
    await newpro.save();

    res.status(201).send("Project created successfully!");
}

const sproject=async(req,res)=>{
    const user= await User.findOne({ username:req.user.username }).populate('projects','-password')
    console.log("user:" ,user)
    const projects = await project.find({ _id: { $in: user.projects } });
    console.log(projects)
    res.json(projects)
}


const pinfo=async(req,res)=>{
    const {projecid}=req.query
    const projectinfo= await project.findOne({ _id:projecid })
    console.log(projectinfo)
    res.json(projectinfo)
}


export default{
    createproject,
    sproject,
    pinfo
}