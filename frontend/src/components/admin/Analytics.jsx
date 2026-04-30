import { useState, useEffect } from "react";
import api from "../../services/api";
import useSocket from "../../hooks/useSocket";
import { ArrowUpRight, Inbox, Clock, CheckCircle2, AlertOctagon } from "lucide-react";

const Analytics = () => {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchStats(); }, []);
  useSocket("new_ticket", fetchStats);
  useSocket("ticket_updated", fetchStats);

  if (!stats) return <div className="p-8 text-sm font-medium text-gray-400">Loading metrics...</div>;

  const metrics = [
    { label: "Total Tickets", val: stats.totalTickets, icon: Inbox, color: "text-slate-900" },
    { label: "Pending", val: stats.openTickets, icon: Clock, color: "text-blue-600" },
    { label: "Resolved", val: stats.resolvedTickets, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Escalated", val: stats.technicalTickets, icon: AlertOctagon, color: "text-red-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Overview</h2>
          <p className="text-sm text-gray-500">Global ticket activity and resolution rates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-gray-200 p-5 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-gray-50 rounded-md ${m.color}`}>
                <m.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live</span>
            </div>
            <p className="text-3xl font-bold tracking-tight">{m.val}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Staffing</h3>
        <div className="flex items-center gap-6">
          <div className="text-4xl font-bold">{stats.totalAgents}</div>
          <div className="h-10 w-[1px] bg-gray-200"></div>
          <p className="text-sm text-gray-600 max-w-xs">
            Active agents currently synchronized with the support dispatch system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;