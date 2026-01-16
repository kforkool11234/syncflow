import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker"; // Make sure you have this package installed
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for DatePicker

function Pinfo() {
    const params = useParams();
    const [arr, setArr] = useState({});
    const [task, setTask] = useState({ name: "", description: "", deadline: null });
    const [showAddTask, setShowAddTask] = useState(false); // State to manage visibility of task input fields
    const [team, setTeam] = useState({ name: "", role: "" });
    const [showAddteam, setShowAddTeam] = useState(false); // State to manage visibility of task input fields
    const [link, setLink] = useState({ name: "", url: "" });
    const [showAddLink, setShowAddLink] = useState(false);

    useEffect(() => {
        const id = params.pid;
        if (id) {
            axios
                .get(`${process.env.REACT_APP_API_URL}/project/pinfo?projecid=${id}`)
                .then((res) => {
                    setArr(res.data);
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log("Error occurred: ", err);
                });
        }
    }, [params]);

    const handleAddTimeline = () => {
        // Handle adding the new task to the timeline
        const token = localStorage.getItem("token");
        if (!task.name || !task.description || !task.deadline) {
            alert("Please fill in all fields for the task.");
            return; // Prevent further execution
        }
        const newTask = {
            name: task.name,
            description: task.description,
            deadline: task.deadline,
        };

        axios.patch(`${process.env.REACT_APP_API_URL}/project/addtask/${arr._id}`, newTask, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setShowAddTask(!showAddTask)
    };
    const handleAddteam = () => {
        // Handle adding the new task to the timeline
        const token = localStorage.getItem("token");
        if (!team.name || !team.role) {
            alert("Please fill in both the name and role for the team member.");
            return; // Prevent further execution
        }
        const newTeam = {
            id: team.name,
            role: team.role,
        };

        axios.patch(`${process.env.REACT_APP_API_URL}/project/addteam/${arr._id}`, newTeam, {
            headers: { Authorization: `Bearer ${token}` }
        })

        setShowAddTeam(!showAddteam)
    };
    const handleAddLink = () => {
        const token = localStorage.getItem("token");
        if (link.name && link.url) {
            const newlink = { name: link.name, url: link.url }
            axios.patch(`${process.env.REACT_APP_API_URL}/project/addlink/${arr._id}`, newlink, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setShowAddLink(false); // Hide input fields after adding
        }
    };
    const handleCheckboxChange = (tid, event) => {
        const token = localStorage.getItem("token");
        const isChecked = event.target.checked; // Get the checked state of the checkbox

        // Send a PATCH request to update the task's done status
        axios.patch(
            `${process.env.REACT_APP_API_URL}/project/taskdone/${arr._id}`,
            { tid, status: isChecked }, // Send taskId and updated done status
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
            .then(response => {
                console.log("Task updated:", response.data);
                // Optionally update local state if needed
                setArr(prev => ({
                    ...prev,
                    timeline: prev.timeline.map(item =>
                        item._id === tid ? { ...item, done: isChecked } : item
                    )
                }));
            })
            .catch(error => {
                console.error("Error updating task status:", error);
            });
    };

    return (
        <div className="content flex flex-col p-8">
            <div className="max-w-6xl mx-auto w-full">
                <div className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-xl border border-white/20 p-8">
                    {/* Header Section */}
                    <div className="border-b border-gray-100 pb-8 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
                                    {arr?.projectName || "PROJECT NAME"}
                                </h1>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">Team Lead</span>
                                    <span className="text-lg">{arr?.Admin || "NAME"}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Project Deadline</p>
                                    <p className="font-bold text-gray-900">
                                        {arr?.deadline ? new Date(arr.deadline).toLocaleDateString(undefined, { dateStyle: 'long' }) : "No deadline set"}
                                    </p>
                                </div>
                                <a
                                    href={arr?.githubLink || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                    Repository
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Timeline & Links */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Timeline Section */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Timeline
                                    </h2>
                                    <button
                                        onClick={() => setShowAddTask(!showAddTask)}
                                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl font-medium transition-all"
                                    >
                                        + Add Task
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {arr.timeline && arr.timeline.length > 0 ? (
                                        arr.timeline.map((item) => (
                                            <div key={item._id} className={`p-5 rounded-2xl border transition-all ${item.done
                                                    ? 'bg-gray-50 border-gray-100 opacity-75'
                                                    : 'bg-white border-gray-200 shadow-sm hover:border-indigo-200'
                                                }`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="pt-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.done}
                                                            onChange={(event) => handleCheckboxChange(item._id, event)}
                                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition-all cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className={`font-bold text-lg ${item.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                                {item.name}
                                                            </h3>
                                                            <span className={`text-xs px-2 py-1 rounded-lg ${new Date(item.deadline) < new Date() && !item.done
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {new Date(item.deadline).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className={`text-gray-600 ${item.done && 'line-through'}`}>{item.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                            <p className="text-gray-500">No timeline items yet.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add Task Form */}
                                {showAddTask && (
                                    <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                                        <h3 className="font-bold text-gray-900 mb-4">New Timeline Task</h3>
                                        <div className="space-y-4">
                                            <input
                                                placeholder="Task Name"
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                                                value={task.name}
                                                onChange={(e) => setTask({ ...task, name: e.target.value })}
                                            />
                                            <textarea
                                                placeholder="Description"
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                                                rows="3"
                                                value={task.description}
                                                onChange={(e) => setTask({ ...task, description: e.target.value })}
                                            ></textarea>
                                            <DatePicker
                                                selected={task.deadline}
                                                onChange={(date) => setTask({ ...task, deadline: date })}
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                                                placeholderText="Due Date"
                                            />
                                            <button
                                                onClick={handleAddTimeline}
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
                                            >
                                                Add Task
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Additional Links Section */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                        Resources
                                    </h2>
                                    <button
                                        onClick={() => setShowAddLink(!showAddLink)}
                                        className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-2 rounded-xl font-medium transition-all"
                                    >
                                        + Add Link
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {arr.links && arr.links.map((linkItem, index) => (
                                        <a
                                            key={index}
                                            href={linkItem.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-purple-200 transition-all group"
                                        >
                                            <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{linkItem.name}</h4>
                                            <span className="text-sm text-gray-500 truncate block mt-1">{linkItem.url}</span>
                                        </a>
                                    ))}
                                    {(!arr.links || arr.links.length === 0) && (
                                        <p className="text-gray-500 text-sm col-span-full italic">No additional resources added.</p>
                                    )}
                                </div>

                                {showAddLink && (
                                    <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <input
                                                placeholder="Link Name"
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                                value={link.name}
                                                onChange={(e) => setLink({ ...link, name: e.target.value })}
                                            />
                                            <input
                                                placeholder="URL (https://...)"
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                                value={link.url}
                                                onChange={(e) => setLink({ ...link, url: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddLink}
                                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all"
                                        >
                                            Save Resource
                                        </button>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Right Column: Team */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Team</h2>
                                    <button
                                        onClick={() => setShowAddTeam(!showAddteam)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {arr.teamMembers && arr.teamMembers.length > 0 ? (
                                        arr.teamMembers.map((member, index) => (
                                            <div key={member._id || index} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                                    {member.id.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{member.id}</p>
                                                    <p className="text-sm text-gray-500">{member.role}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-400 py-4">No team members.</p>
                                    )}
                                </div>

                                {showAddteam && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in">
                                        <div className="space-y-3">
                                            <input
                                                placeholder="Member Name"
                                                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                value={team.name}
                                                onChange={(e) => setTeam({ ...team, name: e.target.value })}
                                            />
                                            <input
                                                placeholder="Role"
                                                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                value={team.role}
                                                onChange={(e) => setTeam({ ...team, role: e.target.value })}
                                            />
                                            <button
                                                onClick={handleAddteam}
                                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all"
                                            >
                                                Add Member
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Floating Button */}
            <Link to={`/chat/${arr.chat}`} className="fixed bottom-8 right-8 z-50">
                <button className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center text-white relative group">
                    <span className="absolute -top-12 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-90 whitespace-nowrap">Open Chat</span>
                    <img
                        src="/assets/chat.png"
                        alt="Chat"
                        className="w-8 h-8 filter brightness-0 invert"
                    />
                </button>
            </Link>
        </div>
    );
}

export default Pinfo;
