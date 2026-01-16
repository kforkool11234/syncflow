import React, { useState, useEffect, useCallback } from 'react';
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
  const { cid } = useParams();
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

  const [isConnected, setIsConnected] = useState(socket.connected);

  const toggleMembers = () => {
    setShowMembers((prev) => !prev);
  };

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onDisconnect);
    };
  }, []);

  const fetchMessages = useCallback(() => {
    if (!cid) return; // Guard clause

    axios.get(`${process.env.REACT_APP_API_URL}/chat/getchat?chatid=${cid}&channel=${channel}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setMessages(res.data.message || []); // Default to empty array if undefined

      // Only update details if they are empty using functional updates to keep dependency stable
      setUdetails(prev => prev.length === 0 ? res.data.udetails : prev);
      setCname(prev => !prev ? res.data.cn : prev);

      const currentUserId = get_idFromToken(token);
      const adminUserIds = res.data.admin || [];
      setIsAdmin(adminUserIds.includes(currentUserId));
    }).catch(err => console.error("Error fetching chat:", err));
  }, [cid, channel]);

  // Polling effect
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected, fetchMessages]);

  useEffect(() => {
    const id = cid;
    socket.emit('join', id);

    // Initial fetch
    fetchMessages();

    socket.on('receiveMessage', (messageData) => {
      console.log("Receiving message");
      setMessages(prev => [...prev, messageData]);
    });

    return () => socket.off('receiveMessage');
  }, [cid, channel, fetchMessages]);

  useEffect(() => {
    socket.on('receiveTask', (newTask) => {
      setMessages(prev => [...prev, { ...newTask, type: 'task' }]);
    });

    socket.on('taskUpdated', (updatedTask) => {
      setMessages(prev => prev.map(msg => msg._id === updatedTask._id ? updatedTask : msg));
    });

    return () => {
      socket.off('receiveTask');
      socket.off('taskUpdated');
    };
  }, []);

  const handleMarkAsDone = (taskId) => {
    if (isConnected) {
      socket.emit('markTaskAsDone', { taskId });
    } else {
      // Fallback or alert for tasks? 
      // For now let's keep tasks on socket mostly, or implement HTTP for tasks too later.
      // Assuming user only asked for chat fallback primarily.
      alert("Real-time connection lost. Task updates might not reflect immediately.");
    }
  };

  const handleSendMessage = async () => {
    const id = cid;

    if (channel === 'task') {
      if (!isAdmin) {
        alert("Only group admins can send messages in this channel.");
        return;
      }

      if (!assignedTo || !dueDate || !taskDescription) {
        alert("Please assign a user, select a due date, and provide a task description.");
        return;
      }

      // Socket only for tasks for now as backend controller doesn't support tasks yet
      if (isConnected) {
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

        setTaskDescription('');
        setAssignedTo('');
        setDueDate(null);
      } else {
        alert("Cannot create tasks while offline/polling mode.");
      }

    } else if (entry.trim()) {
      console.log('Message sent:', entry);

      const messageData = {
        entry,
        sender,
        chat: id,
        channel,
        name,
      };

      if (isConnected) {
        socket.emit('sendMessage', { id, messageData });
        setEntry('');
      } else {
        try {
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/chat/send`,
            { id, messageData },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessages(prev => [...prev, res.data]);
          setEntry('');
        } catch (err) {
          console.error("Failed to send message via HTTP", err);
          alert("Failed to send message. Please try again.");
        }
      }
    }
  };

  return (
    <div className="content flex flex-col h-screen w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden transition-colors duration-300">

        {/* Header */}
        <div
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-b border-gray-100 dark:border-gray-700/50 p-4 flex justify-between items-center cursor-pointer hover:bg-white/60 dark:hover:bg-gray-700/40 transition-colors"
          onClick={toggleMembers}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {cname.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{cname}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Click for members
              </p>
            </div>
          </div>
          <svg className={`w-6 h-6 text-gray-400 transition-transform ${showMembers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>

        {/* Member List Dropdown */}
        {showMembers && (
          <div className="bg-gray-50/90 dark:bg-gray-800/95 border-b border-gray-100 dark:border-gray-700/50 p-4 animate-in slide-in-from-top-2">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Team Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {udetails && udetails.map(user => (
                <div key={user._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600 shadow-sm hover:shadow">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 custom-scrollbar">
          {messages.map((msg, index) => {
            const isOwnMessage = msg.sender === sender;

            return (
              <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm relative group ${msg.type === 'task'
                    ? 'bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/30 w-full sm:w-auto'
                    : isOwnMessage
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                >
                  {msg.type === 'task' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-700/50 pb-2">
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded uppercase">Task</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.due_date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{msg.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>To: <strong>{msg.to.displayName}</strong></span>
                      </div>

                      {msg.to._id === sender && !msg.done && (
                        <label className="flex items-center gap-2 mt-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                          <input
                            type="checkbox"
                            checked={msg.done}
                            onChange={() => handleMarkAsDone(msg._id)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 transition-all"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Done</span>
                        </label>
                      )}
                      {msg.done && (
                        <div className="mt-2 flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-sm">
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
        <div className="p-4 bg-white/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="general">Chat</option>
              <option value="task">Task</option>
            </select>

            {channel === 'task' ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex-grow flex flex-col sm:flex-row gap-2">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Assign To...</option>
                  {udetails.map(user => (
                    <option key={user._id} value={user._id}>{user.displayName}</option>
                  ))}
                </select>
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  className="w-full sm:w-auto p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholderText="Due Date"
                />
                <input
                  placeholder="Task Description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="flex-grow p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                  className="flex-grow p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
