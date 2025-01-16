import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
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
        priority:"normal"
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

        axios.post("http://localhost:5000/createproject", data,{
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

    const priority=(event)=>{
        setSelectedOption(event.target.value)
        setBasicInfo({...basicInfo,priority:selectedOption})
    }

    return (
        <div className="content flex justify-center items-center min-h-screen mt-20">
            <form className=" bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl w-full pt-16">
                <h2 className="text-xl font-bold text-white mb-4">Basic Info</h2>

                <div className="flex space-x-4 mb-4">
                    <label className="flex-1">
                        <h3 className="text-lg text-gray-300">Project Name</h3>
                        <input
                            type="text"
                            placeholder="Project Name"
                            className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                            value={basicInfo.projectName}
                            onChange={(e) => setBasicInfo({ ...basicInfo, projectName: e.target.value })}
                            required
                        />
                    </label>
                    <label className="flex-1">
                        <h3 className="text-lg text-gray-300">Deadline</h3>
                        <DatePicker
                            selected={basicInfo.deadline}
                            onChange={(date) => setBasicInfo({ ...basicInfo, deadline: date })}
                            dateFormat="yyyy-MM-dd"
                            className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                            placeholderText="Select deadline"
                            required
                        />
                    </label>
                    <label htmlFor="priority">Select Priority:</label>
                         <select id="priority" value={selectedOption} onChange={priority}>
                            <option value="normal">normal</option>
                            <option value="high">high</option>
                            <option value="normal">normal</option>
                            <option value="low">low</option>
                        </select>
                </div>

                <label className="block mb-4">
                    <h3 className="text-lg text-gray-300">GitHub Link</h3>
                    <input
                        type="text"
                        placeholder="Enter GitHub link"
                        className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                        value={basicInfo.githubLink}
                        onChange={(e) => setBasicInfo({ ...basicInfo, githubLink: e.target.value })}
                    />
                </label>

                <label className="block mb-4">
                    <h3 className="text-lg text-gray-300">Description</h3>
                    <textarea
                        placeholder="Enter description of the project"
                        className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                        value={basicInfo.description}
                        onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                        required
                    ></textarea>
                </label>

                <h2 className="text-xl font-bold text-white mt-6 mb-4">Timeline:</h2>
                <label className="block mb-4">
                    <input
                        name="name"
                        placeholder="Name of task"
                        className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                        value={task.name}
                        onChange={(e) => setTask({ ...task, name: e.target.value })}
                    />
                    <textarea
                        name="description"
                        placeholder="Description of task"
                        className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                        value={task.description}
                        onChange={(e) => setTask({ ...task, description: e.target.value })}
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

                <ul className="mt-4 text-white">
                    {timeline.map((item, index) => (
                        <li key={index} className="mb-2">
                            <strong>{item.name}</strong> (Deadline: {item.deadline?.toLocaleDateString()})
                        </li>
                    ))}
                </ul>

                <h2 className="text-xl font-bold text-white mt-6 mb-4">Team Member:</h2>

                <div className="flex space-x-4 mb-4">
                    <label className="flex-1">
                        <h3 className="text-lg text-gray-300">Team Member ID</h3>
                        <input
                            name="id"
                            placeholder="Add unique ID of team member"
                            className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                            value={team.id}
                            onChange={(e) => setTeam({ ...team, id: e.target.value })}
                            required
                        />
                    </label>
                    <label className="flex-1">
                        <h3 className="text-lg text-gray-300">Role of Member/Team</h3>
                        <input
                            name="role"
                            placeholder="Enter role/team of the member"
                            className="mt-1 block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                            value={team.role}
                            onChange={(e) => setTeam({ ...team, role: e.target.value })}
                            required
                        />
                    </label>
                </div>

                <button
                    type="button"
                    onClick={handleAddTeamMember}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add Team Member
                </button>

                <ul className="mt-4 text-white">
                    {members.map((member, index) => (
                        <li key={index} className="mb-2">
                            <strong>{member.id}</strong>: {member.role}
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={handleSave}
                    className="block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Save
                </button>
            </form>
        </div>
    );
}

export default PForm;
