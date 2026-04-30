import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, BarChart3, Users, Settings } from "lucide-react";
import Analytics from "../components/admin/Analytics";
import AgentManager from "../components/admin/AgentManager";
import ContextEditor from "../components/admin/ContextEditor";

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Admin: {user?.name}</span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 flex items-center gap-1">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r py-6 flex flex-col gap-2 shadow-sm z-0">
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <BarChart3 size={18} /> Analytics
          </button>
          <button 
            onClick={() => setActiveTab("agents")}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeTab === 'agents' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={18} /> Agent Management
          </button>
          <button 
            onClick={() => setActiveTab("context")}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeTab === 'context' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={18} /> AI Context Editor
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "agents" && <AgentManager />}
          {activeTab === "context" && <ContextEditor />}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
