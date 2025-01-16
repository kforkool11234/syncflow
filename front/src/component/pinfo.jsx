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
    const [team, setTeam] = useState({ name: "", role: ""});
    const [showAddteam, setShowAddTeam] = useState(false); // State to manage visibility of task input fields
    const [link, setLink] = useState({ name: "", url: "" });
    const [showAddLink, setShowAddLink] = useState(false);
   
    useEffect(() => {
        const id = params.pid;
        if (id) {
            axios
                .get(`http://localhost:5000/pinfo?projecid=${id}`)
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

        axios.patch(`http://localhost:5000/project/addtask/${arr._id}`, newTask, {
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

        axios.patch(`http://localhost:5000/project/addteam/${arr._id}`, newTeam, {
            headers: { Authorization: `Bearer ${token}` }
        })
        
        setShowAddTeam(!showAddteam)
    };
    const handleAddLink = () => {
        const token = localStorage.getItem("token");
        if (link.name && link.url) {
            const newlink={name:link.name,url:link.url}
            axios.patch(`http://localhost:5000/project/addlink/${arr._id}`, newlink, {
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
            `http://localhost:5000/project/taskdone/${arr._id}`,
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
        <div className="content flex flex-col mt-10">
            <div className="p-8 max-w-6xl bg-gray-800 text-white rounded-xl shadow-md">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-bold mb-2">
                        {arr?.projectName || "PROJECT NAME"}
                    </h1>
                    <p className="font-medium text-gray-300 mb-4">
                        Team Lead: <span className="text-gray-100">{arr?.Admin || "NAME"}</span>
                    </p>
                </div>

                {/* Deadline and GitHub Link Section */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <h2 className="font-bold text-lg">Deadline:</h2>
                        <p className="text-gray-100">
                            {arr?.deadline ? new Date(arr.deadline).toLocaleString() : "No deadline set."}
                        </p>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">GitHub Link:</h2>
                        <a
                            href={arr?.githubLink || "#"}
                            className="text-blue-400 hover:text-blue-300 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {arr?.githubLink || "+ Add GitHub link"}
                        </a>
                    </div>
                </div>
                {/*additional links*/}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Additional Links:</h2>
                        <button
                            onClick={() => setShowAddLink(!showAddLink)} // Toggle visibility of add link input
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                        >
                            Add Link
                        </button>
                    </div>

                    {arr.links && arr.links.length > 0 ? (
                        arr.links.map((linkItem, index) => (
                            <p key={index} className="text-gray-100">
                                {linkItem.name}:{" "}
                                <a href={linkItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                                    {linkItem.url}
                                </a>
                            </p>
                        ))
                    ) : (
                        <p className="text-gray-400">No links added yet.</p>
                    )}

                    {/* Add New Link Input Fields */}
                    {showAddLink && (
                        <div className="mt-4 border-t border-gray-600 pt-4">
                            <label className="block mb-4">
                                <input
                                    name="link-name"
                                    placeholder="Link Name"
                                    className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                    value={link.name}
                                    onChange={(e) => setLink({ ...link, name: e.target.value })}
                                />
                                <input
                                    name="url"
                                    placeholder="URL"
                                    type="url" // Ensure it's a URL input type for validation
                                    className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                    value={link.url}
                                    onChange={(e) => setLink({ ...link, url: e.target.value })}
                                />
                            </label>
                            <button
                                type="button"
                                onClick={handleAddLink} // Function to handle adding the link (to be defined)
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Add Link
                            </button>
                        </div>
                    )}
                </div>

                {/* Timeline Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Timeline:</h2>
                        <button
                            onClick={() => setShowAddTask(!showAddTask)} // Toggle visibility of add task input
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                        >
                            Add New
                        </button>
                    </div>

                    {arr.timeline && arr.timeline.length > 0 ?(
                        arr.timeline.map((item) => (
                            <div key={item._id} className="flex items-center bg-green-200 text-black rounded-lg shadow p-4 mb-4">
                                <input
                                    type="checkbox"
                                    id={`task-${item._id}`}
                                    checked={item.done} // Checkbox state is tied to the `done` property
                                    onChange={(event) => handleCheckboxChange(item._id, event)} // Pass event to handler
                                    className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500 mr-2"
                                />
                                <label htmlFor={`task-${item._id}`} className="flex-grow">
                                    <p className="font-medium">Name: {item.name}</p>
                                    <p>Description: {item.description}</p>
                                    <p>Deadline: {new Date(item.deadline).toLocaleString()}</p>
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No timeline items available.</p>
                    )}

                    {/* Add New Task Input Fields */}
                    {showAddTask && (
                        <div className="mt-4 border-t border-gray-600 pt-4">
                            <label className="block mb-4">
                                <input
                                    name="name"
                                    placeholder="Name of task"
                                    className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                    value={task.name}
                                    onChange={(e) => setTask({ ...task, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    name="description"
                                    placeholder="Description of task"
                                    className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                    value={task.description}
                                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                                    required
                                ></textarea>
                                <DatePicker
                                    selected={task.deadline}
                                    onChange={(date) => setTask({ ...task, deadline: date })}
                                    dateFormat="yyyy-MM-dd"
                                    className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                    placeholderText="Select deadline"
                                    required
                                />
                            </label>
                            <button
                                type="button"
                                onClick={handleAddTimeline}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Add Timeline
                            </button>
                        </div>
                    )}
                </div>

                {/* Team Members Section */}
                <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg mb-2">Team Members:</h2>
                    <button
                            onClick={() => setShowAddTeam(!showAddteam)} // Toggle visibility of add task input
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                        >Add New
                        </button>
                </div>
                    
                    {arr.teamMembers && arr.teamMembers.length > 0 ? (
                        <ul>
                            {arr.teamMembers.map((member, index) => (
                                <li
                                    key={member._id || index}
                                    className="flex items-center justify-between bg-gray-700 rounded-lg shadow p-4 mb-2"
                                >
                                    <p>Name: {member.id}</p>
                                    <p>Role: {member.role}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No team members added yet.</p>
                    )}
                    {showAddteam && (
                        <div className="mt-4 border-t border-gray-600 pt-4">
                            <label className="block mb-4">
                                <input
                                    name="name"
                                    placeholder="Name Member"
                                    className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                    value={team.name}
                                    onChange={(e) => setTeam({ ...team, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    name="description"
                                    placeholder="Role of member"
                                    className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                    value={team.role}
                                    onChange={(e) => setTeam({ ...team, role: e.target.value })}
                                    required
                                ></textarea>
                                
                            </label>
                            <button
                                type="button"
                                onClick={handleAddteam}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Add Member
                            </button>
                        </div>
                    )}
                </div>

            </div>
            <Link to={`/chat/${arr.chat}`}>
      <button className="fixed bottom-4 right-4 bg-transparent p-0 cursor-pointer">
        <img 
          src="/assets/chat.png"
          alt="Chat Button" 
          className="w-12 h-12"
        />
      </button>
    </Link>
        </div>
    );
}

export default Pinfo;
