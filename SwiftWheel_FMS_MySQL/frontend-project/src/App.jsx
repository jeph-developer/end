import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Vehicles from "./pages/Vehicles";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Navbar from "./components/Navbar";
import api from "./api";

function PrivateRoute({ children, loggedIn }) {
  return loggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        setLoggedIn(res.data.loggedIn);
        setUsername(res.data.username || "");
      })
      .catch(() => setLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setLoggedIn(false);
    setUsername("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {loggedIn && <Navbar username={username} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={
          loggedIn ? <Navigate to="/vehicles" replace /> :
          <Login setLoggedIn={setLoggedIn} setUsername={setUsername} />
        } />
        <Route path="/vehicles"    element={<PrivateRoute loggedIn={loggedIn}><Vehicles /></PrivateRoute>} />
        <Route path="/trips"       element={<PrivateRoute loggedIn={loggedIn}><Trips /></PrivateRoute>} />
        <Route path="/maintenance" element={<PrivateRoute loggedIn={loggedIn}><Maintenance /></PrivateRoute>} />
        <Route path="/reports"     element={<PrivateRoute loggedIn={loggedIn}><Reports /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={loggedIn ? "/vehicles" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
