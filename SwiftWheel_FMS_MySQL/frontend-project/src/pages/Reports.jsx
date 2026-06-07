import React, { useState } from "react";
import api from "../api";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("trips");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tripsReport, setTripsReport] = useState(null);
  const [fleetReport, setFleetReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true); setError("");
    try {
      if (activeTab === "trips") {
        const res = await api.get(`/reports/daily-trips?date=${date}`);
        setTripsReport(res.data);
      } else {
        const res = await api.get("/reports/fleet-status");
        setFleetReport(res.data);
      }
    } catch {
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const availabilityColor = (status) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "Unavailable") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Reports</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setActiveTab("trips"); setTripsReport(null); setError(""); }}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === "trips" ? "bg-blue-800 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}>
          Daily Trip Report
        </button>
        <button onClick={() => { setActiveTab("fleet"); setFleetReport(null); setError(""); }}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === "fleet" ? "bg-blue-800 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}>
          Fleet Status Report
        </button>
      </div>

      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {activeTab === "trips" && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Report Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
            </div>
          )}
          <button onClick={handleGenerate} disabled={loading}
            className="bg-blue-800 text-white px-5 py-2 rounded text-sm hover:bg-blue-900 disabled:opacity-60">
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

      {/* Daily Trip Report */}
      {activeTab === "trips" && tripsReport && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Daily Trip Report — {tripsReport.date}</h2>
            <span className="text-sm text-gray-400">SwiftWheel FMS</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-800">{tripsReport.summary.totalTrips}</div>
              <div className="text-xs text-gray-500 mt-1">Total Trips</div>
            </div>
            <div className="bg-green-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{Number(tripsReport.summary.totalFuelConsumed).toFixed(1)} L</div>
              <div className="text-xs text-gray-500 mt-1">Total Fuel Consumed</div>
            </div>
            <div className="bg-yellow-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-yellow-700">{Number(tripsReport.summary.totalCost).toLocaleString()} RWF</div>
              <div className="text-xs text-gray-500 mt-1">Total Cost</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Vehicle</th>
                  <th className="px-4 py-2 text-left">Driver</th>
                  <th className="px-4 py-2 text-left">Destination</th>
                  <th className="px-4 py-2 text-left">Fuel (L)</th>
                  <th className="px-4 py-2 text-left">Cost (RWF)</th>
                </tr>
              </thead>
              <tbody>
                {tripsReport.trips.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-4 text-center text-gray-400">No trips for this date</td></tr>
                ) : (
                  tripsReport.trips.map((t, i) => (
                    <tr key={t.id || i} className="border-t">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{t.vehicleName || "N/A"}</td>
                      <td className="px-4 py-2">{t.driver}</td>
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
      )}

      {/* Fleet Status Report */}
      {activeTab === "fleet" && fleetReport && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Daily Fleet Status Report</h2>
            <span className="text-xs text-gray-400">Generated: {new Date(fleetReport.generatedAt).toLocaleString()}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Vehicle Name</th>
                  <th className="px-4 py-2 text-left">Plate No.</th>
                  <th className="px-4 py-2 text-left">Fuel Type</th>
                  <th className="px-4 py-2 text-left">Fuel Consumed (L)</th>
                  <th className="px-4 py-2 text-left">Maintenance Status</th>
                  <th className="px-4 py-2 text-left">Vehicle Availability</th>
                </tr>
              </thead>
              <tbody>
                {fleetReport.report.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-4 text-center text-gray-400">No vehicles found</td></tr>
                ) : (
                  fleetReport.report.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{r.vehicleName}</td>
                      <td className="px-4 py-2">{r.plateNumber}</td>
                      <td className="px-4 py-2">{r.fuelType}</td>
                      <td className="px-4 py-2">{Number(r.totalFuelConsumed).toFixed(1)}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          r.maintenanceStatus === "Available"         ? "bg-green-100 text-green-700" :
                          r.maintenanceStatus === "Under Maintenance" ? "bg-yellow-100 text-yellow-700" :
                          r.maintenanceStatus === "Out of Service"    ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-600"}`}>
                          {r.maintenanceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${availabilityColor(r.vehicleAvailability)}`}>
                          {r.vehicleAvailability}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
