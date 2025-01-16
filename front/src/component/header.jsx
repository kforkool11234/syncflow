import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./index.css";

function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove token from localStorage
        // Optionally, redirect to login page or refresh the page
        window.location.reload(); // Reload the page to reflect changes
    };

    return (
        <div className="main header flex justify-between items-center p-4">
            <h2 className="ml-20 mt-3 text-2xl font-extrabold">SYNCFLOW</h2>
            {token ? (
                <div className="relative">
                    {/* SVG Icon */}
                    <svg 
                        className="mr-20 mt-1 text-gray-800 dark:text-white cursor-pointer" 
                        aria-hidden="true" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        width="50" 
                        height="50" 
                        fill="currentColor"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown on click
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z" 
                            clipRule="evenodd"
                        />
                    </svg>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                            <ul className="py-2">
                                <li>
                                    <Link 
                                        to="/profile" 
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <button 
                                        onClick={handleLogout} 
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                // If token does not exist, show login and signup options
                <div className="flex space-x-4 mr-20">
                    <Link to="/login" className="text-gray-800 dark:text-white hover:underline">Login</Link>
                    <Link to="/signup" className="text-gray-800 dark:text-white hover:underline">Sign Up</Link>
                </div>
            )}
        </div>
    );
}

export default Header;
