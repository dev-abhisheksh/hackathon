import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, BarChart3, Users, Settings, AlertCircle, LayoutDashboard, Menu, X, Ticket as TicketIcon } from "lucide-react";
import Analytics from "../components/admin/Analytics";
import AgentManager from "../components/admin/AgentManager";
import ContextEditor from "../components/admin/ContextEditor";
import Escalations from "../components/admin/Escalations";

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "analytics", label: "Dashboard", icon: BarChart3 },
    { id: "escalations", label: "Escalations", icon: AlertCircle },
    { id: "agents", label: "Agent Team", icon: Users },
    { id: "context", label: "AI Settings", icon: Settings },
  ];

  return (
    <div className="h-screen bg-gray-50 text-slate-900 flex flex-col">
      <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-md">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <TicketIcon className="text-blue-600" size={22} />
            <span className="font-bold tracking-tight text-lg">Nexus <span className="text-blue-600 font-black">Admin</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold leading-none">{user?.name || "Administrator"}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase mt-1">
              Org Admin <span className="text-blue-500 font-bold ml-1 px-1.5 py-0.5 bg-blue-50 rounded">Code: {user?.orgCode || user?.orgId?.toString().slice(-6).toUpperCase()}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`
          fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform lg:relative lg:top-0 lg:h-full lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === item.id
                    ? "bg-slate-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-slate-900"
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
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