import React from "react"
import { Link, useLocation } from "react-router-dom";
import "./index.css"

function Sidebar(){
    const location = useLocation();
    
    const navItems = [
        { to: '/project', label: 'Projects', icon: '📋' },
        { to: '/task', label: 'Tasks', icon: '✓' },
        { to: '/chat', label: 'Chat', icon: '💬' },
        { to: '/calender', label: 'Calendar', icon: '📅' }
    ];

    return(
        <div className="sidebar">
            <div className="px-6 py-4 mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    SyncFlow
                </h2>
            </div>
            
            <nav className="flex-1 px-4">
                {navItems.map((item) => (
                    <Link 
                        key={item.to}
                        to={item.to} 
                        className={`item ${location.pathname === item.to ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : ''}`}
                    >
                        <span className="text-xl mr-3">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
            
            <div className="px-6 py-4 text-xs text-gray-400 border-t border-gray-100">
                <p>© 2024 SyncFlow</p>
            </div>
        </div>
    )
}

export default Sidebar