import express from "express";
import bodyParser from "body-parser";
import Cors from "cors";
import dotenv from "dotenv";
import userroute from "./routes/user.js";
import projectroute from "./routes/project.js";
import chatroute from "./routes/chat.js";
import taskroute from "./routes/task.js";
import otherroute from "./routes/others.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(Cors({
  origin: process.env.CLIENT_URL
}));

// Routes
app.use('/registration/', userroute);
app.use("/project/", projectroute);
app.use('/chat/', chatroute);
app.use('/task/', taskroute);
app.use('/', otherroute);
export default app;
