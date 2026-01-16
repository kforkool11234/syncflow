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
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/task/gettask?userId=${userId}`);
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
            await axios.patch(`${process.env.REACT_APP_API_URL}/task/updatetask/${taskId}`, { done: true }, {
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

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
    if (error) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-red-500 bg-red-100 p-4 rounded-xl shadow-sm">{error}</div>
        </div>
    );

    return (
        <div className="content flex-col p-8">
            <div className="max-w-6xl mx-auto w-full">
                <div className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Assigned Tasks</h2>
                            <p className="text-gray-600">Track and manage your project deliverables</p>
                        </div>

                        {/* Sort and Filter Options */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative group">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="appearance-none w-full sm:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer hover:bg-white"
                                >
                                    <option value="asc">↑ Due Date (Earliest)</option>
                                    <option value="desc">↓ Due Date (Latest)</option>
                                    <option value="latest">Newest Assigned</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            <div className="relative group">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none w-full sm:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer hover:bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="grid gap-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <div
                                    key={task._id}
                                    className={`group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${task.done
                                            ? 'bg-gray-50 border-gray-100 opacity-75'
                                            : 'bg-white border-gray-100 hover:border-indigo-200 shadow-sm'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${task.done
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                    {task.done ? 'COMPLETED' : 'PENDING'}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{task.chat.chatName}</h3>
                                            </div>

                                            <p className="text-gray-600 leading-relaxed max-w-2xl">
                                                {task.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                    <span className="font-medium text-gray-700">Assigned by:</span> {task.to.displayName}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    <span className={`font-medium ${new Date(task.due_date) < new Date() && !task.done ? 'text-red-600' : 'text-gray-700'}`}>
                                                        Due: {new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            {!task.done && (
                                                <button
                                                    onClick={() => handleMarkAsDone(task._id)}
                                                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    Mark Done
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {statusFilter !== 'all' ? `No ${statusFilter} tasks available.` : 'You have no assigned tasks yet.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskList;
