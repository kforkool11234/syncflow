import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/registration/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token); // Store token in local storage
      alert("Login successful!");
      navigate("/project"); // Redirect after successful login
    } catch (error) {
      console.error(error);
      alert("Login failed! Please check your credentials.");
    }
  };

    return (
        <div className="content flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <a href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                                Sign up here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
