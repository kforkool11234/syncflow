import User from "../models/user.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const usersignup=async(req,res)=>{
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
}

const userlogin=async (req, res) => {
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
}

export default{
    usersignup,
    userlogin
}