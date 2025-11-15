import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { socketHandler } from './socket/index.js';
import cors from "cors"
connectDB();
app.use(cors({
  origin: process.env.CLIENT_URL
}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    pingTimeout: 30000
  },
});

socketHandler(io);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
