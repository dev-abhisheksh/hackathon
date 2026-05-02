import { useState, useEffect } from "react";
import api from "../../services/api";
import useSocket from "../../hooks/useSocket";
import { ArrowUpRight, Inbox, Clock, CheckCircle2, AlertOctagon } from "lucide-react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b'];

const formatData = (dataArray) => {
  if (!dataArray) return [];
  return dataArray.map(item => ({ name: item._id, value: item.count || item.averageConfidence || 0 }));
};

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

  const statusData = formatData(stats.ticketsByStatus);
  const priorityData = formatData(stats.ticketsByPriority);
  const categoryData = formatData(stats.ticketsByCategory);
  const confidenceData = formatData(stats.aiConfidenceByCategory).map(d => ({ ...d, value: Math.round(d.value) }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [value, 'Tickets']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Priority Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Tickets by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Tickets by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [value, 'Tickets']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: AI Confidence */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">AI Confidence by Category (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{fontSize: 12}} />
                <YAxis dataKey="name" type="category" tick={{fontSize: 12}} width={80} />
                <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value) => [`${value}%`, 'Confidence']} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Avg Confidence" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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