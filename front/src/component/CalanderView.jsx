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
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/getCalendarData?userId=${userId}&un=${un}`);

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
                backgroundColor = '#6366f1'; // Indigo-500
                break;
            case 'project':
                backgroundColor = '#3b82f6'; // Blue-500
                break;
            default:
                backgroundColor = '#8b5cf6'; // Purple-500
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '0.85rem',
                padding: '2px 5px',
            },
        };
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className='content flex flex-col items-center min-h-screen pt-28 pb-12 px-4'>
            <div className="bg-white/95 backdrop-blur-3xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-6xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Task & Project Calendar
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">Visualize your timeline and deadlines</p>
                    </div>
                </div>

                <div className="h-[600px] bg-white rounded-2xl shadow-inner p-4 border border-gray-100">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        defaultView="month"
                        views={['month', 'week', 'agenda']} // Added more views for better utility
                        popup
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        className="custom-calendar" // Add custom class if needed for specific overrides
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
