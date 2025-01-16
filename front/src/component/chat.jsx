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
    <div className="content flex-col items-center">
      {/* Search Input */}
      <div className="flex justify-center items-center w-11/12 mt-5">
        <input
          type="text"
          placeholder="Search..."
          className="border border-black bg-transparent p-2 rounded-full focus:outline-none focus:ring focus:ring-blue-500 w-11/12"
        />
      </div>
      {/* Displaying chat items */}
      {arr.map((item, index) => (
        <Link to={`/chat/${item._id}`} key={index} className="w-11/12">
          {console.log(item)}
          <Paper
            elevation={8}
            style={{  height: "100px", padding: "10px" }}
            className="mt-10 hover:bg-gray-200 transition duration-200 hover:scale-105"
          >
            <div className="flex flex-col">
              {/* Name in Bold */}
              <span className="font-bold text-lg">{item.chatName}</span>
              {/* Latest Message */}
              {console.log(item.latestMessage)}
              {item.latestMessage && <span className="text-sm text-gray-600">{item.latestMessage.name}:{item.latestMessage.content}</span>}
              
            </div>
          </Paper>
        </Link>
      ))}
    </div>
  );
}

export default Chat;
