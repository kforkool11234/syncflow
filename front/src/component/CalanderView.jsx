import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const get_idFromToken = (token) => {
        if (!token) {
            console.log("No token found");
            return null;
        }
        const decoded = jwtDecode(token);
        return decoded._id;
    };

    const getusermnameFromToken = (token) => {
        if (!token) {
            console.log("No token found");
            return null;
        }
        const decoded = jwtDecode(token);
        return decoded.id;
    };

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const userId = get_idFromToken(token);
                const un = getusermnameFromToken(token);
                // Include username in the request
                const response = await axios.get(`http://localhost:5000/getCalendarData?userId=${userId}&un=${un}`);
                
                // Format events correctly
                const formattedEvents = response.data.map(event => ({
                    id: event.id,
                    title: `${event.title} (${event.type})`, // Add type to title
                    start: new Date(event.end), // Set start to be the same as end
                    end: new Date(event.end),   // End is still the same
                    type: event.type,
                    assignedTo: event.assignedTo,
                    done: event.done,
                }));

                // Filter for pending tasks only
                const filteredEvents = formattedEvents.filter(event => 
                    !(event.type === 'task' && event.done) // Exclude completed tasks
                );

                setEvents(filteredEvents);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching calendar data:", err);
                setError('Failed to load calendar data');
                setLoading(false);
            }
        };

        fetchCalendarData();
    }, [token]);

    const handleSelectEvent = (event) => {
        if (event.type === 'task') {
            navigate(`/task`); // Assuming your task route is defined as /task/:id
        } else if (event.type === 'project') {
            navigate(`/project/${event.id}`); // Assuming your project route is defined as /project/:id
        }
    };

    // Define styles based on event type
    const eventStyleGetter = (event) => {
        let backgroundColor;
        
        switch (event.type) {
            case 'task':
                backgroundColor = '#ADD8E6'; // Light blue for tasks
                break;
            case 'project':
                backgroundColor = '#00008B'; // Dark blue for projects
                break;
            default:
                backgroundColor = '#ffffff'; // Default color if needed
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
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
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Calendar
                                </h1>
                                <p className="text-gray-600 mt-1">Track your tasks and project deadlines</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-white/20 shadow-lg">
                                <div className="flex items-center gap-4 px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                        <span className="text-sm font-medium text-gray-600">Tasks</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                        <span className="text-sm font-medium text-gray-600">Projects</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Events</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.type === 'task').length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h6m-6 4h6m-6 4h6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.type === 'project').length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Calendar Container */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    Today
                                </button>
                                <div className="w-px h-6 bg-gray-300"></div>
                                <button className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Month
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="calendar-wrapper bg-white rounded-2xl shadow-inner p-4" style={{ height: 600 }}>
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: '100%' }}
                                defaultView="month"
                                views={['month']}
                                popup
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={eventStyleGetter}
                                components={{
                                    toolbar: ({ label, onNavigate, onView }) => (
                                        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => onNavigate('PREV')}
                                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                                                <button
                                                    onClick={() => onNavigate('NEXT')}
                                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => onNavigate('TODAY')}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                            >
                                                Today
                                            </button>
                                        </div>
                                    )
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
