import jwt from 'jsonwebtoken';
import handleChatEvents from './chat.js';
import handleTaskEvents from './task.js';
export const socketHandler = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      // Verify and decode token (replace 'your_jwt_secret' with your actual secret)
      const decoded = jwt.verify(token, 'your_jwt_secret'); 
      socket.userId = decoded._id; // Attach userId to socket object
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id, 'UserId:', socket.userId);

    // Join a personal room for this user to send notifications directly
    socket.join(socket.userId);

    // Now when user joins a chat room:
    socket.on('join', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room: ${roomId}`);
    });

    handleChatEvents(socket, io);
    handleTaskEvents(socket, io);
  });
};
