import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import {jwtDecode} from 'jwt-decode';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="content flex-col items-center">
      <div className="flex justify-center items-center w-11/12 mt-5">
        <input
          type="text"
          placeholder="Search..."
          className="border border-black bg-transparent p-2 rounded-full focus:outline-none focus:ring focus:ring-blue-500 w-11/12"
        />
      </div>

      {arr.map((item, index) => (
        // Remove Link and handle navigation manually after delete
        <div
          key={index}
          className="w-11/12 cursor-pointer"
          onClick={() => handleChatClick(item._id)}
        >
          <Paper
            elevation={8}
            style={{ height: "100px", padding: "10px" }}
            className="mt-10 hover:bg-gray-200 transition duration-200 hover:scale-105 relative"
          >
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-bold text-lg">{item.chatName}</span>
                {item.hasNotification && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      backgroundColor: "green",
                      borderRadius: "50%",
                      marginLeft: 8,
                    }}
                    title="New messages"
                  />
                )}
              </div>
              {item.latestMessage && (
                <span className="text-sm text-gray-600">
                  {item.latestMessage.name}: {item.latestMessage.content}
                </span>
              )}
            </div>
          </Paper>
        </div>
      ))}
    </div>
  );
}

export default Chat;
