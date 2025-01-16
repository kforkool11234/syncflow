import React, { useState, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import styles for DatePicker

const socket = io('http://localhost:5000');

const ChatUI = () => {
  const params = useParams();
  const [showMembers, setShowMembers] = useState(false);
  const [entry, setEntry] = useState('');
  const [udetails, setUdetails] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cname, setCname] = useState('');
  const [channel, setChannel] = useState('general'); // State for channel selection
  const [assignedTo, setAssignedTo] = useState(''); // User to assign task
  const [dueDate, setDueDate] = useState(null); // Due date for task
  const [taskDescription, setTaskDescription] = useState(''); // Task description
  const [isAdmin, setIsAdmin] = useState(false); // Check if user is admin
  
  const token = localStorage.getItem("token");

  function get_idFromToken(token) {
    if (!token) {
      console.log("No token found");
      return null;
    }
    const decoded = jwtDecode(token);
    return decoded._id;
  }

  function getdnFromToken(token) {
    if (!token) {
      console.log("No token found");
      return null;
    }
    const decoded = jwtDecode(token);
    return decoded.dn;
  }

  const name = getdnFromToken(token);
  const sender = get_idFromToken(token);

  const toggleMembers = () => {
    setShowMembers((prev) => !prev);
  };

  useEffect(() => {
    const id = params.cid;
    socket.emit('join', id);
    
    // Fetch initial messages from the backend
    console.log(channel)
    axios.get(`http://localhost:5000/chat/getchat?chatid=${id}&channel=${channel}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setMessages(res.data.message); // Load previous messages (tasks or regular)
      setUdetails(res.data.udetails); // Load user details
      setCname(res.data.cn); // Load chat name
      
      // Check if the current user is an admin
      const currentUserId = get_idFromToken(token);
      const adminUserIds = res.data.admin
      setIsAdmin(adminUserIds.includes(currentUserId));

      console.log(res.data);
    });

    socket.on('receiveMessage', (messageData) => {
      console.log("Receiving message");
      setMessages(prev => [...prev, messageData]); // Append new messages
    });

    return () => socket.off('receiveMessage');
  }, [params,channel]);

  useEffect(() => {
    socket.on('receiveTask', (newTask) => {
        setMessages(prev => [...prev, { ...newTask, type: 'task' }]); // Add logic for displaying tasks
    });

    socket.on('taskUpdated', (updatedTask) => {
        // Logic for updating the displayed task in your UI if needed
        setMessages(prev => prev.map(msg => msg._id === updatedTask._id ? updatedTask : msg));
    });
    
    return () => {
        socket.off('receiveTask');
        socket.off('taskUpdated');
    };
}, []);

const handleMarkAsDone = (taskId) => {
    socket.emit('markTaskAsDone', { taskId });
};

const handleSendMessage = () => {
    const id = params.cid;

    if (channel === 'task') {
        if (!isAdmin) {
            alert("Only group admins can send messages in this channel.");
            return;
        }
        
        if (!assignedTo || !dueDate || !taskDescription) {
            alert("Please assign a user, select a due date, and provide a task description.");
            return;
        }

        const taskData = {
            entry: taskDescription,
            sender,
            chat: id,
            channel,
            name,
            assignedTo,
            dueDate,
        };
        
        socket.emit('sendMessage', { id, messageData: taskData });
        
        // Reset fields after sending
        setTaskDescription('');
        setAssignedTo('');
        setDueDate(null);
        
    } else if (entry.trim()) {
        console.log('Message sent:', entry);
        
        const messageData = {
            entry,
            sender,
            chat: id,
            channel,
            name,
        };
        
        socket.emit('sendMessage', { id, messageData });
        
        setEntry(''); // Clear input after sending
    }
};

return (
    <div className="content flex flex-col h-screen bg-gray-800 text-white w-11/12">
      <div
        className="bg-blue-600 text-center py-4 cursor-pointer sticky top-0 z-10"
        onClick={toggleMembers}
      >
        <h1 className="text-2xl">{cname}</h1> {/* Display chat name */}
      </div>

      {showMembers && (
        <div className="bg-gray-700 text-white p-4">
          <h2 className="text-lg font-semibold">Members</h2>
          <ul className="list-disc pl-5">
            {/* Assuming udetails is an array of users */}
            {udetails && udetails.map(user => (
              <li key={user._id}>
                {user.displayName} {/* Displaying each user's display name */}
                <p>username: {user.username}</p> {/* Displaying each user's username */}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto bg-gray-900 rounded">
        {/* Map over messages and display them */}
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            {msg.type === 'task' ? (
                <>
                    <strong>Assigned To:</strong> {msg.to.displayName}
                    <p><strong>Due Date:</strong> {msg.due_date}</p>
                    <p><strong>Description:</strong> {msg.description}</p>
                    {/* Checkbox to mark as done - only visible to assigned user */}
                    {msg.to._id === sender &&( msg.done==false ?(
                        <label className="flex items-center mt-2">
                            <input 
                                type="checkbox" 
                                checked={msg.done}
                                onChange={() => handleMarkAsDone(msg._id)} 
                                className="mr-2"
                            />
                            Mark as Done
                        </label>
                    ):<p></p>)}
                    {msg.done==true ?(<p><strong>Completed</strong></p>):null}

                </>
            ) : (
                <>
                    <strong>{msg.name}:</strong> {msg.content}
                </>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-700 p-4 flex items-center">
        {/* Dropdown for channel selection */}
        <select 
          value={channel} 
          onChange={(e) => setChannel(e.target.value)} 
          className="mr-2 p-2 border border-gray-600 bg-gray-800 text-white rounded"
        >
          <option value="general">General</option>
          <option value="task">Task</option>
        </select>

        {/* Conditional rendering based on selected channel */}
        {channel === 'task' ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex flex-col w-full">
            <select 
              value={assignedTo} 
              onChange={(e) => setAssignedTo(e.target.value)} 
              className="mb-2 p-2 border border-gray-600 bg-gray-800 text-white rounded"
            >
              <option value="">Assign To</option>
              {udetails.map(user => (
                <option key={user._id} value={user._id}>{user.displayName}</option>
              ))}
            </select>
            <DatePicker 
              selected={dueDate} 
              onChange={(date) => setDueDate(date)} 
              className="mb-2 p-2 border border-gray-600 bg-gray-800 text-white rounded"
              placeholderText="Select Due Date"
            />
            <textarea
              placeholder="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
              className="mb-2 w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
            />
            <button type="submit" className="ml-2 p-2 bg-blue-600 rounded">
              <SendHorizontal />
            </button>
          </form>
        ) : (
          <>
            <input
              type="text"
              placeholder="Type your message..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
            />
            <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-600 rounded">
              <SendHorizontal />
            </button>
          </>
        )}
        
      </div>
    </div>
  );
};

export default ChatUI;
