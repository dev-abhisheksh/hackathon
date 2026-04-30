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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Organization Overview</h2>
        <p className="text-gray-500 mt-1">Real-time metrics and system health</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start transition hover:shadow-md">
          <span className="text-gray-500 text-sm font-semibold mb-3 tracking-wide uppercase">Total Tickets</span>
          <span className="text-4xl font-bold text-gray-900">{stats.totalTickets}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-start transition hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-0"></div>
          <span className="text-blue-600 text-sm font-semibold mb-3 tracking-wide uppercase z-10">Open Tickets</span>
          <span className="text-4xl font-bold text-blue-700 z-10">{stats.openTickets}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-start transition hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-0"></div>
          <span className="text-emerald-600 text-sm font-semibold mb-3 tracking-wide uppercase z-10">Resolved</span>
          <span className="text-4xl font-bold text-emerald-700 z-10">{stats.resolvedTickets}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col items-start transition hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-0"></div>
          <span className="text-red-500 text-sm font-semibold mb-3 tracking-wide uppercase z-10 flex items-center gap-2">Escalations <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span></span>
          <span className="text-4xl font-bold text-red-600 z-10">{stats.technicalTickets}</span>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">Team Capacity</h3>
        <p className="text-gray-500 text-sm">Total active support agents across the organization: <span className="font-bold text-blue-600 text-lg ml-1">{stats.totalAgents}</span></p>
      </div>
    </div>
  );
};

export default Analytics;
