import { useState, useEffect } from "react";
import api from "../../services/api";

const AgentManager = () => {
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await api.get("/admin/agents");
      setAgents(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/agents", formData);
      setFormData({ name: "", email: "", password: "" });
      fetchAgents();
    } catch (error) {
      alert("Failed to create agent: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-2/3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Active Agents</h2>
        <div className="flex-1 overflow-y-auto pr-2">
          {agents.length === 0 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 text-sm">No agents found. Add one from the panel.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {agents.map(agent => (
                <div key={agent._id} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Agent</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-1/3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Agent</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input 
              type="text" required placeholder="Jane Doe"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input 
              type="email" required placeholder="jane@company.com"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temporary Password</label>
            <input 
              type="password" required placeholder="••••••••"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 mt-2 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Creating Agent..." : "Create Agent"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentManager;
