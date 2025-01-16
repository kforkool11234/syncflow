import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // Default sort order
    const [statusFilter, setStatusFilter] = useState('all'); // Default status filter

    const token = localStorage.getItem("token"); 
    function get_idFromToken(token) {
        if (!token) {
            console.log("No token found");
            return null;
        }
        const decoded = jwtDecode(token);
        return decoded._id;
    }

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const userId = get_idFromToken(token);
                const response = await axios.get(`http://localhost:5000/task/gettask?userId=${userId}`);
                setTasks(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError('Failed to load tasks');
                setLoading(false);
            }
        };

        fetchTasks();
    }, [token]);

    // Function to handle sorting
    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortOrder === 'asc') {
            return new Date(a.due_date) - new Date(b.due_date);
        } else if (sortOrder === 'desc') {
            return new Date(b.due_date) - new Date(a.due_date);
        } else if (sortOrder === 'latest') {
            return new Date(b.createdAt) - new Date(a.createdAt); // Assuming createdAt is available
        }
        return 0; // No change
    });

    // Function to filter tasks by status
    const filteredTasks = sortedTasks.filter(task => {
        if (statusFilter === 'completed') return task.done;
        if (statusFilter === 'pending') return !task.done;
        return true; // For 'all', show all tasks
    });

    // Function to mark a task as done
    const handleMarkAsDone = async (taskId) => {
        try {
            await axios.patch(`http://localhost:5000/task/updatetask/${taskId}`, { done: true }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Update local state to reflect the change
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskId ? { ...task, done: true } : task
                )
            );
        } catch (err) {
            console.error("Error marking task as done:", err);
            setError('Failed to update task status');
        }
    };

    if (loading) return <div className="text-center text-gray-500">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className='content ml-20'>
            <div className="w-10/12">
                <h2 className="text-2xl font-bold text-white mb-4">Assigned Tasks</h2>
                
                {/* Sort and Filter Options Side by Side */}
                <div className="flex justify-between mb-4">
                    {/* Sort Order Dropdown */}
                    <label className="block text-gray-300 mr-4">
                        Sort by:
                        <select 
                            value={sortOrder} 
                            onChange={(e) => setSortOrder(e.target.value)} 
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            <option value="asc">Ascending due date</option>
                            <option value="desc">Descending due date</option>
                            <option value="latest">Latest</option>
                        </select>
                    </label>

                    {/* Status Filter Dropdown */}
                    <label className="block text-gray-300">
                        Filter by Status:
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </label>
                </div>

                {/* Task List */}
                <ul className="space-y-4">
                    {filteredTasks.map(task => (
                        <li key={task._id} className="p-4 bg-gray-700 rounded-md shadow hover:bg-gray-600 transition duration-200">
                            <strong className="text-white">Project:</strong> {task.chat.chatName} <br />
                            <strong className="text-white">Description:</strong> {task.description} <br />
                            <strong className="text-white">Assigned To:</strong> {task.to.displayName} <br />
                            <strong className="text-white">Due Date:</strong> {new Date(task.due_date).toLocaleDateString()} <br />
                            <strong className="text-white">Status:</strong> {task.done ? "Completed" : "Pending"}<br />
                            {/* Show Mark as Done button only if the task is pending */}
                            {!task.done && (
                                <button 
                                    onClick={() => handleMarkAsDone(task._id)} 
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition duration-200"
                                >
                                    Mark as Done
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TaskList;
