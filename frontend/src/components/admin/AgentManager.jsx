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
    <div className="flex gap-8 h-full">
      <div className="w-2/3 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Active Agents</h2>
        {agents.length === 0 ? (
          <p className="text-gray-500 text-sm">No agents found. Add one from the panel.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {agents.map(agent => (
              <div key={agent._id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                <div>
                  <p className="font-medium text-gray-800">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.email}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">Agent</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-1/3 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Add New Agent</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" required 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" required 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input 
              type="password" required 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Agent"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentManager;
