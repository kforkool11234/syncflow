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
            <div className="p-6 bg-gray-800 rounded-lg shadow-md w-11/12">
            <h2 className="text-2xl font-bold text-white mb-4">Task and Project Calendar</h2>
            <div style={{ height: 500 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    defaultView="month"
                    views={['month']}
                    popup
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter} // Apply styles based on event type
                />
            </div>
        </div>
        </div>
        
    );
};

export default CalendarView;
