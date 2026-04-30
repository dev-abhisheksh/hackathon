import { useState, useEffect } from "react";
import api from "../../services/api";

const Analytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-gray-500">Loading analytics...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Organization Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-gray-500 text-sm font-medium mb-2">Total Tickets</span>
          <span className="text-4xl font-bold text-gray-800">{stats.totalTickets}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center">
          <span className="text-blue-500 text-sm font-medium mb-2">Open Tickets</span>
          <span className="text-4xl font-bold text-blue-600">{stats.openTickets}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 flex flex-col items-center">
          <span className="text-green-500 text-sm font-medium mb-2">Resolved</span>
          <span className="text-4xl font-bold text-green-600">{stats.resolvedTickets}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 flex flex-col items-center">
          <span className="text-red-500 text-sm font-medium mb-2">Technical Escalations</span>
          <span className="text-4xl font-bold text-red-600">{stats.technicalTickets}</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-semibold text-lg mb-4">Team Statistics</h3>
        <p className="text-gray-600">Total Active Agents: <span className="font-bold">{stats.totalAgents}</span></p>
      </div>
    </div>
  );
};

export default Analytics;
