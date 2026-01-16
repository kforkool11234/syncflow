import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PForm() {
    const token = localStorage.getItem("token");
    function getUsernameFromToken(token) {
        if (!token) {
            console.log("No token found");
            return null;
        }
        const decoded = jwtDecode(token);
        return decoded.id;
    }

    const [basicInfo, setBasicInfo] = useState({
        projectName: "",
        deadline: null, // Date object for React Datepicker
        githubLink: "",
        description: "",
        priority: "normal"
    });
    const [task, setTask] = useState({
        name: "",
        description: "",
        deadline: null, // Date object for React Datepicker
    });
    const [timeline, setTimeline] = useState([]);
    const [team, setTeam] = useState({
        id: "",
        role: "",
    });
    const [members, setMembers] = useState([]);
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('normal');
    const handleSave = () => {
        if (timeline.length === 0 || members.length === 0) {
            alert("Please add at least one timeline and one team member.");
            return;
        }
        const Admin = getUsernameFromToken(token);
        const data = {
            basicInfo: {
                ...basicInfo,
                deadline: basicInfo.deadline ? basicInfo.deadline.toISOString() : null,
            },
            timeline: timeline.map((item) => ({
                ...item,
                deadline: item.deadline ? item.deadline.toISOString() : null,
            })),
            members,
            Admin,
        };

        console.log("Processed Data:", data);

        axios.post(`${process.env.REACT_APP_API_URL}/project/createproject`, data, {
            headers: { Authorization: `Bearer ${token}` } // Include the token here
        })
            .then(() => navigate("/project"))
            .catch((err) => console.error(err));
    };

    const handleAddTimeline = () => {
        setTimeline([...timeline, task]);
        setTask({ name: "", description: "", deadline: null });
    };

    const handleAddTeamMember = () => {
        setMembers([...members, team]);
        setTeam({ id: "", role: "" });
    };

    const priority = (event) => {
        setSelectedOption(event.target.value)
        setBasicInfo({ ...basicInfo, priority: selectedOption })
    }

    return (
        <div className="content flex justify-center items-start min-h-screen pt-22 pb-12 px-4">
            <form className="bg-white/95 backdrop-blur-3xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8 border-b border-gray-100 pb-4">
                    Create New Project
                </h2>

                <div className="space-y-6">
                    {/* Basic Info Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-1 block">Project Name</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Website Redesign"
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    value={basicInfo.projectName}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, projectName: e.target.value })}
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-1 block">Deadline</span>
                                <DatePicker
                                    selected={basicInfo.deadline}
                                    onChange={(date) => setBasicInfo({ ...basicInfo, deadline: date })}
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    placeholderText="Select deadline"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-1 block">Priority</span>
                                <div className="relative">
                                    <select
                                        id="priority"
                                        value={selectedOption}
                                        onChange={priority}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-1 block">GitHub Link</span>
                                <input
                                    type="text"
                                    placeholder="https://github.com/..."
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    value={basicInfo.githubLink}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, githubLink: e.target.value })}
                                />
                            </label>

                            <label className="block md:col-span-2">
                                <span className="text-sm font-medium text-gray-700 mb-1 block">Description</span>
                                <textarea
                                    placeholder="Brief description of the project goals and scope..."
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    rows="3"
                                    value={basicInfo.description}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                    required
                                ></textarea>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6"></div>

                    {/* Timeline Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Initial Timeline
                        </h3>

                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    name="name"
                                    placeholder="Task Name"
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={task.name}
                                    onChange={(e) => setTask({ ...task, name: e.target.value })}
                                />
                                <DatePicker
                                    selected={task.deadline}
                                    onChange={(date) => setTask({ ...task, deadline: date })}
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    placeholderText="Task Deadline"
                                />
                                <textarea
                                    name="description"
                                    placeholder="Task Details"
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white md:col-span-2"
                                    rows="2"
                                    value={task.description}
                                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddTimeline}
                                className="w-full py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold rounded-xl transition-all"
                            >
                                + Add to Timeline
                            </button>
                        </div>

                        {timeline.length > 0 && (
                            <ul className="space-y-2 mb-4">
                                {timeline.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <span className="font-medium text-gray-800">{item.name}</span>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.deadline?.toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-6"></div>

                    {/* Team Members Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Team Members
                        </h3>

                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <input
                                    name="id"
                                    placeholder="Member ID / Username"
                                    className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                    value={team.id}
                                    onChange={(e) => setTeam({ ...team, id: e.target.value })}
                                />
                                <input
                                    name="role"
                                    placeholder="Role (e.g. Frontend Dev)"
                                    className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                    value={team.role}
                                    onChange={(e) => setTeam({ ...team, role: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddTeamMember}
                                className="w-full py-2 bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded-xl transition-all"
                            >
                                + Add Member
                            </button>
                        </div>

                        {members.length > 0 && (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {members.map((member, index) => (
                                    <li key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                                            {member.id.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{member.id}</p>
                                            <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all transform duration-200"
                    >
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PForm;
