import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [arr, setArr] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  function getUserIdFromToken(token) {
    if (!token) {
      console.log("No token found");
      return null;
    }
    const decoded = jwtDecode(token);
    return decoded.id;
  }

  useEffect(() => {
    const userId = getUserIdFromToken(token);
    if (userId) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setArr(res.data);
        })
        .catch((err) => {
          console.log("Error occurred: ", err);
        });
    }
  }, [token]);

  // New: Handle chat click, delete notifications then navigate
  const handleChatClick = async (chatId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // After deletion, navigate to the chat page
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to delete notifications for chat:", error);
      // Still navigate even if delete fails (optional)
      navigate(`/chat/${chatId}`);
    }
  };

  return (
    <div className="content flex justify-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-4xl space-y-8">
        {/* Search Header */}
        <div className="bg-white/95 backdrop-blur-3xl p-6 rounded-3xl shadow-xl border border-white/20">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full p-4 pl-12 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-4">
          {arr.map((item, index) => (
            <div
              key={index}
              className="group w-full cursor-pointer bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/40 hover:shadow-2xl hover:scale-[1.02] hover:bg-white transition-all duration-300 relative overflow-hidden"
              onClick={() => handleChatClick(item._id)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex flex-col gap-2 pl-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {item.chatName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-lg text-gray-800 group-hover:text-indigo-700 transition-colors">{item.chatName}</span>
                  </div>
                  {item.hasNotification && (
                    <span className="bg-green-500 w-3 h-3 rounded-full shadow-lg shadow-green-300 animate-pulse ring-2 ring-white"></span>
                  )}
                </div>
                {item.latestMessage && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm ml-14 group-hover:text-gray-700 transition-colors">
                    <span className="font-semibold text-gray-700">{item.latestMessage.name}:</span>
                    <span className="truncate max-w-[200px] sm:max-w-md">{item.latestMessage.content}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Chat;
