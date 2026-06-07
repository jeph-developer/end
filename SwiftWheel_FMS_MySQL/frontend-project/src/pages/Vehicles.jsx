import React, { useState, useEffect } from "react";
import api from "../api";

const emptyForm = { vehicleName: "", plateNumber: "", model: "", fuelType: "", capacity: "" };
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch {
      setError("Failed to load vehicles");
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await api.post("/vehicles", form);
      setSuccess("Vehicle added successfully");
      setForm(emptyForm);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Vehicles</h1>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Add New Vehicle</h2>
        {error   && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-3">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Vehicle Name</label>
              <input name="vehicleName" value={form.vehicleName} onChange={handleChange} required
                placeholder="e.g. Toyota Land Cruiser"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Plate Number</label>
              <input name="plateNumber" value={form.plateNumber} onChange={handleChange} required
                placeholder="e.g. RAB 123 A"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Model</label>
              <input name="model" value={form.model} onChange={handleChange} required
                placeholder="e.g. 2022"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fuel Type</label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600">
                <option value="">-- Select Fuel Type --</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Carrying Capacity (tons)</label>
              <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required
                placeholder="e.g. 5"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="bg-blue-800 text-white px-5 py-2 rounded text-sm hover:bg-blue-900 disabled:opacity-60">
            {loading ? "Adding..." : "Add Vehicle"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="font-semibold text-gray-700 p-4 border-b">Registered Vehicles</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Vehicle Name</th>
              <th className="px-4 py-2 text-left">Plate Number</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Fuel Type</th>
              <th className="px-4 py-2 text-left">Capacity (tons)</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-4 text-center text-gray-400">No vehicles registered yet</td></tr>
            ) : (
              vehicles.map((v, i) => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">{v.vehicleName}</td>
                  <td className="px-4 py-2">{v.plateNumber}</td>
                  <td className="px-4 py-2">{v.model}</td>
                  <td className="px-4 py-2">{v.fuelType}</td>
                  <td className="px-4 py-2">{v.capacity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
