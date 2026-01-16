import React, { useState, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import styles for DatePicker


const token = localStorage.getItem("token");
const socket = io(`${process.env.REACT_APP_API_URL}`, {
  auth: {
    token: token, // or just the user ID if you want
  }
})

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
    axios.get(`${process.env.REACT_APP_API_URL}/chat/getchat?chatid=${id}&channel=${channel}`, {
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
  }, [params, channel]);

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
    <div className="content flex flex-col h-screen w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col h-full bg-white/80 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">

        {/* Header */}
        <div
          className="bg-white/50 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-white/60 transition-colors"
          onClick={toggleMembers}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {cname.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{cname}</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Click for members
              </p>
            </div>
          </div>
          <svg className={`w-6 h-6 text-gray-400 transition-transform ${showMembers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>

        {/* Member List Dropdown */}
        {showMembers && (
          <div className="bg-gray-50/90 border-b border-gray-100 p-4 animate-in slide-in-from-top-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Team Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {udetails && udetails.map(user => (
                <div key={user._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-gray-100 shadow-sm hover:shadow">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-900 text-sm truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 custom-scrollbar">
          {messages.map((msg, index) => {
            const isMe = msg.sender === sender || (msg.type === 'task' && msg.sender === sender);
            const isOwnMessage = msg.sender === sender;

            return (
              <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm relative group ${msg.type === 'task'
                      ? 'bg-white border border-indigo-100 w-full sm:w-auto'
                      : isOwnMessage
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                >
                  {msg.type === 'task' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase">Task</span>
                        <span className="text-xs text-gray-500">{new Date(msg.due_date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{msg.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>To: <strong>{msg.to.displayName}</strong></span>
                      </div>

                      {msg.to._id === sender && !msg.done && (
                        <label className="flex items-center gap-2 mt-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                          <input
                            type="checkbox"
                            checked={msg.done}
                            onChange={() => handleMarkAsDone(msg._id)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition-all"
                          />
                          <span className="text-sm font-medium text-gray-700">Mark as Done</span>
                        </label>
                      )}
                      {msg.done && (
                        <div className="mt-2 flex items-center gap-1 text-green-600 font-medium text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Completed
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {!isOwnMessage && <p className="text-xs font-bold text-gray-400 mb-1">{msg.name}</p>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content || msg.entry}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="general">Chat</option>
              <option value="task">Task</option>
            </select>

            {channel === 'task' ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex-grow flex flex-col sm:flex-row gap-2">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Assign To...</option>
                  {udetails.map(user => (
                    <option key={user._id} value={user._id}>{user.displayName}</option>
                  ))}
                </select>
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  className="w-full sm:w-auto p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholderText="Due Date"
                />
                <input
                  placeholder="Task Description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="flex-grow p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button type="submit" className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
                  <SendHorizontal size={20} />
                </button>
              </form>
            ) : (
              <div className="flex-grow flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={entry}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  onChange={(e) => setEntry(e.target.value)}
                  className="flex-grow p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  <SendHorizontal size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
