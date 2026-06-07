import React, { useState } from "react";
import api from "../api";

export default function Login({ setLoggedIn, setUsername }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (isRegister) {
        await api.post("/auth/register", form);
        setSuccess("Account created! You can now log in.");
        setIsRegister(false);
        setForm({ username: "", password: "" });
      } else {
        const res = await api.post("/auth/login", form);
        setLoggedIn(true);
        setUsername(res.data.username);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-blue-800 mb-1">SwiftWheel</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Fleet Management System</p>

        <h2 className="text-lg font-semibold mb-4">{isRegister ? "Create Account" : "Login"}</h2>

        {error   && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} required
              placeholder="Enter username"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              placeholder="Enter password (min 6 chars)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-blue-800 text-white py-2 rounded hover:bg-blue-900 text-sm font-medium disabled:opacity-60">
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? "Already have an account?" : "No account yet?"}{" "}
          <button onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
            className="text-blue-700 hover:underline font-medium">
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
