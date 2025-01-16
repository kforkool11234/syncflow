import React, { useState } from "react";
import axios from "axios";

function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/signup", { username, password, displayName: displayName });
            alert("Signup successful!");
            console.log(username, password, displayName)
        } catch (error) {
            console.error(error);
            alert("Signup failed!");
        }
    };

    return (
        <div className=" content flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-gray-800 p-8 rounded-lg shadow-md max-w-sm w-full" onSubmit={handleSignup}>
                <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="displayName">Display Name</label>
                    <input
                        type="text"
                        id="displayName"
                        placeholder="Enter your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200"
                >
                    Signup
                </button>
            </form>
        </div>
    );
}

export default Signup;
