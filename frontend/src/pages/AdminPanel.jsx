import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, BarChart3, Users, Settings, AlertCircle, LayoutDashboard } from "lucide-react";
import Analytics from "../components/admin/Analytics";
import AgentManager from "../components/admin/AgentManager";
import ContextEditor from "../components/admin/ContextEditor";
import Escalations from "../components/admin/Escalations";

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-800 font-sans flex flex-col">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center z-10 shadow-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Admin Console</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
            <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Organization Admin</span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors duration-150 ease-in-out"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-100 py-8 flex flex-col gap-1 z-0 shrink-0">
          <div className="px-6 mb-2 text-xs font-bold text-gray-400 tracking-wider uppercase">Menu</div>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-4 px-6 py-3.5 text-sm font-semibold transition-all duration-150 ease-in-out ${activeTab === 'analytics' ? 'bg-blue-50/80 text-blue-700 border-l-4 border-blue-600' : 'text-gray-500 hover:bg-gray-50 border-l-4 border-transparent hover:text-gray-900'}`}
          >
            <BarChart3 size={18} className={activeTab === 'analytics' ? 'text-blue-600' : 'text-gray-400'} />
            Overview
          </button>

          <button
            onClick={() => setActiveTab("escalations")}
            className={`flex items-center gap-4 px-6 py-3.5 text-sm font-semibold transition-all duration-150 ease-in-out ${activeTab === 'escalations' ? 'bg-red-50/80 text-red-700 border-l-4 border-red-500' : 'text-gray-500 hover:bg-gray-50 border-l-4 border-transparent hover:text-gray-900'}`}
          >
            <AlertCircle size={18} className={activeTab === 'escalations' ? 'text-red-500' : 'text-gray-400'} />
            Escalations
            <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px] font-bold">LIVE</span>
          </button>

          <div className="px-6 mt-6 mb-2 text-xs font-bold text-gray-400 tracking-wider uppercase">Configuration</div>

          <button
            onClick={() => setActiveTab("agents")}
            className={`flex items-center gap-4 px-6 py-3.5 text-sm font-semibold transition-all duration-150 ease-in-out ${activeTab === 'agents' ? 'bg-blue-50/80 text-blue-700 border-l-4 border-blue-600' : 'text-gray-500 hover:bg-gray-50 border-l-4 border-transparent hover:text-gray-900'}`}
          >
            <Users size={18} className={activeTab === 'agents' ? 'text-blue-600' : 'text-gray-400'} />
            Agent Management
          </button>
          <button
            onClick={() => setActiveTab("context")}
            className={`flex items-center gap-4 px-6 py-3.5 text-sm font-semibold transition-all duration-150 ease-in-out ${activeTab === 'context' ? 'bg-blue-50/80 text-blue-700 border-l-4 border-blue-600' : 'text-gray-500 hover:bg-gray-50 border-l-4 border-transparent hover:text-gray-900'}`}
          >
            <Settings size={18} className={activeTab === 'context' ? 'text-blue-600' : 'text-gray-400'} />
            AI Instructions
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#F9FAFB]">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "escalations" && <Escalations />}
            {activeTab === "agents" && <AgentManager />}
            {activeTab === "context" && <ContextEditor />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
