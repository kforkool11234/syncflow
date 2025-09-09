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
        <div className='content'>
            <div className="w-full max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    My Tasks
                                </h1>
                                <p className="text-gray-600 mt-1">Manage and track your assigned tasks</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-white/20 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600 px-3">Total: {filteredTasks.length}</span>
                                    <div className="w-px h-6 bg-gray-300"></div>
                                    <span className="text-sm font-medium text-green-600 px-3">
                                        Completed: {filteredTasks.filter(task => task.done).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort by
                            </label>
                            <select 
                                value={sortOrder} 
                                onChange={(e) => setSortOrder(e.target.value)} 
                                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                <option value="asc">Ascending due date</option>
                                <option value="desc">Descending due date</option>
                                <option value="latest">Latest</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Status
                            </label>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)} 
                                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                <option value="all">All Tasks</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <div className="flex bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
                                {['all', 'pending', 'completed'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                            statusFilter === filter
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Task Grid */}
                <div className="grid gap-6">
                    {filteredTasks.length === 0 ? (
                        <div className="col-span-full">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-12 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                                <p className="text-gray-600">
                                    {statusFilter === 'all' 
                                        ? "You don't have any tasks assigned yet." 
                                        : `No ${statusFilter} tasks found.`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <div key={task._id} className={`task-card group bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] p-6 ${task.done ? 'opacity-75' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${task.done ? 'bg-green-500' : 'bg-orange-500'} shadow-lg`}></div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            task.done 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {task.done ? "Completed" : "Pending"}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            Due: {new Date(task.due_date).toLocaleDateString()}
                                        </div>
                                        {!task.done && (
                                            <button 
                                                onClick={() => handleMarkAsDone(task._id)} 
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                            >
                                                ✓ Mark Done
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h6m-6 4h6m-6 4h6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Project</p>
                                            <p className="text-gray-900 font-semibold">{task.chat.chatName}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-sm text-gray-500 font-medium mb-1">Description</p>
                                        <p className="text-gray-900 leading-relaxed">{task.description}</p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Assigned to</p>
                                            <p className="text-gray-900 font-semibold">{task.to.displayName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskList;
