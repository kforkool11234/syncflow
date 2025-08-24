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
        <div className="content flex-col">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
                        <p className="text-gray-600">Manage your projects and track progress</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {/* Sort Dropdown */}
                        <select
                            value={sortCriteria}
                            onChange={(e) => setSortCriteria(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                        >
                            <option value="deadline">Sort by Deadline</option>
                            <option value="priority">Sort by Priority</option>
                            <option value="latest">Sort by Latest</option>
                        </select>

                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-full sm:w-64"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 mb-8">
                {sortedProjects().map((project) => (
                    <Link 
                        to={`/project/${project._id}`} 
                        key={project._id} 
                        className="group block"
                    >
                        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-indigo-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {project.projectName}
                                        </h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-gray-600">
                                                Due: {new Date(project.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-gray-600">Admin: {project.Admin}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                            </svg>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                project.priority === 'High' ? 'bg-red-100 text-red-600' :
                                                project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                                {project.priority}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {project.githubLink && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                            </svg>
                                            <span className="text-indigo-600 hover:text-indigo-700 transition-colors text-sm truncate">
                                                GitHub Repository
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Floating Action Button */}
            <Link to={'/newproject'}>
                <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group">
                    <svg className="w-8 h-8 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </Link>
        </div>
    );
}

export default Project;
