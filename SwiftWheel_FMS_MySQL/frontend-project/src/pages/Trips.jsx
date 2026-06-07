import React, { useState, useEffect } from "react";
import api from "../api";

const emptyForm = { vehicle: "", driver: "", tripDate: "", destination: "", fuelConsumed: "", tripCost: "" };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [tripsRes, vehiclesRes] = await Promise.all([
        api.get("/trips"),
        api.get("/vehicles"),
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
    } catch {
      setError("Failed to load data");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      // MySQL backend uses vehicleId; send both for compatibility
      const payload = { ...form, vehicleId: form.vehicle };
      await api.post("/trips", payload);
      setSuccess("Trip recorded successfully");
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Trips</h1>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Record New Trip</h2>
        {error   && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-3">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Vehicle</label>
              <select name="vehicle" value={form.vehicle} onChange={handleChange} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600">
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleName} ({v.plateNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Driver Name</label>
              <input name="driver" value={form.driver} onChange={handleChange} required
                placeholder="e.g. Jean Claude"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Trip Date</label>
              <input name="tripDate" type="date" value={form.tripDate} onChange={handleChange} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Destination</label>
              <input name="destination" value={form.destination} onChange={handleChange} required
                placeholder="e.g. Musanze District"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fuel Consumed (L)</label>
              <input name="fuelConsumed" type="number" min="0" step="0.01" value={form.fuelConsumed} onChange={handleChange} required
                placeholder="e.g. 45.5"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Trip Cost (RWF)</label>
              <input name="tripCost" type="number" min="0" step="0.01" value={form.tripCost} onChange={handleChange} required
                placeholder="e.g. 25000"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="bg-blue-800 text-white px-5 py-2 rounded text-sm hover:bg-blue-900 disabled:opacity-60">
            {loading ? "Recording..." : "Record Trip"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="font-semibold text-gray-700 p-4 border-b">Trip Records</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Vehicle</th>
              <th className="px-4 py-2 text-left">Driver</th>
              <th className="px-4 py-2 text-left">Trip Date</th>
              <th className="px-4 py-2 text-left">Destination</th>
              <th className="px-4 py-2 text-left">Fuel (L)</th>
              <th className="px-4 py-2 text-left">Cost (RWF)</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-4 text-center text-gray-400">No trips recorded yet</td></tr>
            ) : (
              trips.map((t, i) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{t.vehicleName || "N/A"}</td>
                  <td className="px-4 py-2">{t.driver}</td>
                  <td className="px-4 py-2">{new Date(t.tripDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{t.destination}</td>
                  <td className="px-4 py-2">{t.fuelConsumed}</td>
                  <td className="px-4 py-2">{Number(t.tripCost).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
