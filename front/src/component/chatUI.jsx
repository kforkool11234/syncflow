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
    <div className="content flex flex-col h-screen w-full max-w-6xl mx-auto">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-3xl mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-8 cursor-pointer transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
          onClick={toggleMembers}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{cname}</h1>
                <p className="text-green-100 text-sm">Click to view members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-100">{udetails.length} members</span>
            </div>
          </div>
        </div>

        {showMembers && (
          <div className="bg-white p-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Team Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {udetails && udetails.map(user => (
                <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.displayName}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Messages Area */}
      <div className="flex-grow bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-3xl mb-4 overflow-hidden flex flex-col">
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
                <p className="text-gray-600">Send your first message to begin collaborating.</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="group">
                  {msg.type === 'task' ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Task</span>
                            {msg.done && <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">✓ Completed</span>}
                          </div>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/80 rounded-xl p-4">
                                <p className="text-sm text-gray-600 font-medium mb-1">Assigned to</p>
                                <p className="font-semibold text-gray-900">{msg.to.displayName}</p>
                              </div>
                              <div className="bg-white/80 rounded-xl p-4">
                                <p className="text-sm text-gray-600 font-medium mb-1">Due Date</p>
                                <p className="font-semibold text-gray-900">{new Date(msg.due_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div className="bg-white/80 rounded-xl p-4">
                              <p className="text-sm text-gray-600 font-medium mb-2">Description</p>
                              <p className="text-gray-900 leading-relaxed">{msg.description}</p>
                            </div>

                            {msg.to._id === sender && !msg.done && (
                              <div className="pt-2">
                                <button
                                  onClick={() => handleMarkAsDone(msg._id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Mark as Done
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {msg.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-2xl p-4 group-hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{msg.name}</span>
                          <span className="text-xs text-gray-500">now</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Channel:</span>
              <select 
                value={channel} 
                onChange={(e) => setChannel(e.target.value)} 
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
              >
                <option value="general">💬 General</option>
                <option value="task">📋 Tasks</option>
              </select>
            </div>
          </div>

          {channel === 'task' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to</label>
                  <select 
                    value={assignedTo} 
                    onChange={(e) => setAssignedTo(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select team member</option>
                    {udetails.map(user => (
                      <option key={user._id} value={user._id}>{user.displayName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due date</label>
                  <DatePicker 
                    selected={dueDate} 
                    onChange={(date) => setDueDate(date)} 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholderText="Select due date"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task description</label>
                <textarea
                  placeholder="Describe the task..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <SendHorizontal className="w-4 h-4" />
                Create Task
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage} 
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
