import React, { useState, useEffect } from "react";
import api from "../api";

const emptyForm = { vehicle: "", serviceType: "", maintenanceCost: "", maintenanceDate: "", vehicleStatus: "" };
const STATUS_OPTIONS = ["Available", "Under Maintenance", "Out of Service"];

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [mRes, vRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/vehicles"),
      ]);
      setRecords(mRes.data);
      setVehicles(vRes.data);
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
      const payload = { ...form, vehicleId: form.vehicle };
      if (editId) {
        await api.put(`/maintenance/${editId}`, payload);
        setSuccess("Maintenance record updated");
      } else {
        await api.post("/maintenance", payload);
        setSuccess("Maintenance record added");
      }
      setForm(emptyForm); setEditId(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r) => {
    setForm({
      vehicle: String(r.vehicleId || r.vehicle || ""),
      serviceType: r.serviceType,
      maintenanceCost: r.maintenanceCost,
      maintenanceDate: r.maintenanceDate
        ? new Date(r.maintenanceDate).toISOString().split("T")[0]
        : "",
      vehicleStatus: r.vehicleStatus,
    });
    setEditId(r.id);
    setError(""); setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this maintenance record?")) return;
    try {
      await api.delete(`/maintenance/${id}`);
      setSuccess("Record deleted");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const statusColor = (status) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "Under Maintenance") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Maintenance</h1>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">
          {editId ? "Edit Maintenance Record" : "Add Maintenance Record"}
        </h2>
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Service Type</label>
              <input name="serviceType" value={form.serviceType} onChange={handleChange} required
                placeholder="e.g. Oil Change, Tire Replacement"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Maintenance Cost (RWF)</label>
              <input name="maintenanceCost" type="number" min="0" step="0.01" value={form.maintenanceCost} onChange={handleChange} required
                placeholder="e.g. 50000"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Maintenance Date</label>
              <input name="maintenanceDate" type="date" value={form.maintenanceDate} onChange={handleChange} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Vehicle Status</label>
              <select name="vehicleStatus" value={form.vehicleStatus} onChange={handleChange} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600">
                <option value="">-- Select Status --</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="bg-blue-800 text-white px-5 py-2 rounded text-sm hover:bg-blue-900 disabled:opacity-60">
              {loading ? "Saving..." : editId ? "Update Record" : "Add Record"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="font-semibold text-gray-700 p-4 border-b">Maintenance Records</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Vehicle</th>
              <th className="px-4 py-2 text-left">Service Type</th>
              <th className="px-4 py-2 text-left">Cost (RWF)</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-4 text-center text-gray-400">No maintenance records yet</td></tr>
            ) : (
              records.map((r, i) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{r.vehicleName || "N/A"}</td>
                  <td className="px-4 py-2">{r.serviceType}</td>
                  <td className="px-4 py-2">{Number(r.maintenanceCost).toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(r.maintenanceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${statusColor(r.vehicleStatus)}`}>
                      {r.vehicleStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(r)}
                        className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500">Edit</button>
                      <button onClick={() => handleDelete(r.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
