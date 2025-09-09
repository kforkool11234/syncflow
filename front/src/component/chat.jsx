import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import {jwtDecode} from "jwt-decode"; // Ensure this is installed and imported correctly
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link from React Router

function Chat() {
  const [arr, setArr] = useState([]);
  const token = localStorage.getItem("token");

  function getUsernameFromToken(token) {
    if (!token) {
      console.log("No token found");
      return null;
    }
    const decoded = jwtDecode(token);
    return decoded.id;
  }

  useEffect(() => {
    const username = getUsernameFromToken(token);
    if (username) {
      axios
        .get("http://localhost:5000/chat", {
          headers: { Authorization: `Bearer ${token}` }, // Include the token here
        })
        .then((res) => {
          setArr(res.data);
          console.log(res.data);
        })
        .catch((err) => {
          console.log("Error occurred: ", err);
        });
    }
  }, [token]);

  return (
    <div className="content">
      <div className="w-full max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-gray-600 mt-1">Connect with your team and collaborate</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-white/20 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 px-3 py-2">
                    {arr.length} Conversations
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg transition-all duration-200 hover:shadow-xl text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Enhanced Chat List */}
        <div className="space-y-4">
          {arr.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600">Start a new conversation to collaborate with your team.</p>
            </div>
          ) : (
            arr.map((item, index) => (
              <Link 
                to={`/chat/${item._id}`} 
                key={index} 
                className="block group"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] p-6 group-hover:border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Chat Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-semibold text-lg">
                            {item.chatName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                            {item.chatName}
                          </h3>
                          <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                            {item.latestMessage && new Date(item.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        {/* Latest Message */}
                        {item.latestMessage ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              {item.latestMessage.name}:
                            </span>
                            <span className="text-sm text-gray-500 truncate">
                              {item.latestMessage.content}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No messages yet</p>
                        )}
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 ml-4">
                      <svg 
                        className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors transform group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Click to open conversation</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
