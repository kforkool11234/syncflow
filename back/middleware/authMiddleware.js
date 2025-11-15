import jwt from "jsonwebtoken";
import User from "../models/user.js"
import project from "../models/project.js"
const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.sendStatus(403); // Forbidden
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
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

export default{
    authenticateJWT,
    adminOnly
}