import message from "../models/message.js"
import task from "../models/task.js"
const handletaskevent=(socket,io)=>{
    socket.on('sendMessage', async ({ id, messageData }) => {
        if (messageData.channel != 'task') return 
        try {
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
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

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
}

export default handletaskevent