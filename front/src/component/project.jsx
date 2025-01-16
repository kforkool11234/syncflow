import React, { useState, useEffect } from "react";
import Paper from '@mui/material/Paper';
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function Project() {
    const [arr, setarr] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('latest'); // Default sort by deadline
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
            axios.get('http://localhost:5000/project', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => {
                    setarr(res.data);
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log("Error occurred: ", err);
                });
        }
    }, [token]);

    // Function to determine the background color based on deadline
    const getDeadlineColor = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const timeDiff = deadlineDate - now; // Difference in milliseconds
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days

        if (daysDiff < 0) {
            return '#ffcccc'; // Past deadline (light red)
        } else if (daysDiff <= 7) {
            return '#ffebcc'; // 1 week away (light orange)
        } else if (daysDiff <= 14) {
            return '#ffffcc'; // 2 weeks away (light yellow)
        } else {
            return '#ccffcc'; // More than 2 weeks away (light green)
        }
    };

    // Sorting function
    const sortedProjects = () => {
        return [...arr].sort((a, b) => {
            if (sortCriteria === 'deadline') {
                return new Date(a.deadline) - new Date(b.deadline); // Sort by deadline
            } else if (sortCriteria === 'priority') {
                return a.priority - b.priority; // Sort by priority (assuming priority is a number)
            }else{
                return arr
            }
            return 0; // Default case
        });
    };

    return (
        <div className="content flex-col items-center">
            <div className="flex justify-between items-center w-11/12 mt-5">
                {/* Sort Options on the Left */}
                <div className="flex items-center">
                    <select 
                        value={sortCriteria} 
                        onChange={(e) => setSortCriteria(e.target.value)} 
                        className="border border-black p-2 rounded mr-4"
                    >
                        <option value="deadline">Sort by Deadline</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="latest">Sort by latest</option>
                    </select>
                </div>

                {/* Search Input Centered */}
                <input
                    type="text"
                    placeholder="Search..."
                    className="border border-black bg-transparent p-2 rounded-full focus:outline-none focus:ring focus:ring-blue-500 w-11/12"
                />
            </div>

            {sortedProjects().map((project) => (
                <Link 
                    to={`/project/${project._id}`} 
                    key={project._id} 
                    className="mt-10 w-11/12 mx-auto" 
                >
                    <Paper
                        key={project._id}
                        elevation={8}
                        style={{ backgroundColor: getDeadlineColor(project.deadline) }} // Set background color dynamically
                        className="flex flex-col p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{project.projectName}</h3>
                            <p className="text-sm text-gray-600">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-blue-600 truncate">GitHub Link: {project.githubLink}</p>
                            <p className="text-sm text-gray-600 truncate">Admin: {project.Admin}</p>
                            <p className="text-sm text-gray-600 truncate">Priority: {project.priority}</p>
                        </div>
                    </Paper>
                </Link>
            ))}

            <Link to={'/newproject'}>
                <div 
                    className="fixed bottom-4 right-4 w-20 h-20 mr-5 mb-5 bg-[rgba(47,48,50,1)] rounded-full flex items-center justify-center"
                >
                    <svg 
                        viewBox="0 0 1024 1024" 
                        className="w-16 h-16" 
                        version="1.1" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="#000000"
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path 
                                d="M512 1024C229.7 1024 0 794.3 0 512S229.7 0 512 0s512 229.7 512 512-229.7 512-512 512z m0-938.7C276.7 85.3 85.3 276.7 85.3 512S276.7 938.7 512 938.7 938.7 747.3 938.7 512 747.3 85.3 512 85.3z" 
                                fill="#2f3032"
                            ></path>
                            <path 
                                d="M682.7 554.7H341.3c-23.6 0-42.7-19.1-42.7-42.7s19.1-42.7 42.7-42.7h341.3c23.6 0 42.7 19.1 42.7 42.7s-19.1 42.7-42.6 42.7z" 
                                fill="#0026ff"
                            ></path>
                            <path 
                                d="M512 725.3c-23.6 0-42.7-19.1-42.7-42.7V341.3c0-23.6 19.1-42.7 42.7-42.7s42.7 19.1 42.7 42.7v341.3c0 23.6-19.1 42.7-42.7 42.7z" 
                                fill="#0026ff"
                            ></path>
                        </g>
                    </svg>
                </div>
            </Link>

            <p style={{ color: "rgba(66,66,66,1)" }}>.</p>

        </div>
    );
}

export default Project;
