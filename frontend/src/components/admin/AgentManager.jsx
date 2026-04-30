import { useState, useEffect } from "react";
import api from "../../services/api";
import { UserPlus, User } from "lucide-react";

const AgentManager = () => {
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await api.get("/admin/agents");
      setAgents(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/agents", formData);
      setFormData({ name: "", email: "", password: "" });
      fetchAgents();
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-sm uppercase tracking-wider text-gray-500">Active Staff</h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {agents.map(agent => (
            <div key={agent._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-md hover:bg-gray-50">
              <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-600 font-bold">
                {agent.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{agent.name}</p>
                <p className="text-xs text-gray-500 truncate">{agent.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit sticky top-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <UserPlus size={18} /> New Agent
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Name</label>
            <input
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 outline-none text-sm transition-all"
              type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email</label>
            <input
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 outline-none text-sm transition-all"
              type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Password</label>
            <input
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 outline-none text-sm transition-all"
              type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-md hover:bg-slate-800 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Agent"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentManager;