import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import TicketQueue from "../components/agent/TicketQueue";
import TicketDetail from "../components/agent/TicketDetail";
import { LogOut, LayoutDashboard, User, ChevronLeft, Ticket as TicketIcon } from "lucide-react";

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { user, logout } = useAuth();

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchTickets(); }, []);
  useSocket("new_ticket", (t) => setTickets((prev) => [t, ...prev]));
  useSocket("ticket_updated", fetchTickets);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Back Button for Mobile */}
          {selectedTicket && (
            <button
              onClick={() => setSelectedTicket(null)}
              className="lg:hidden p-1 mr-1 hover:bg-gray-100 rounded-md text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <TicketIcon className="text-blue-600" size={20} />
            <h1 className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">Nexus <span className="text-blue-600 font-black">Agent</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-md">
            <User size={14} className="text-gray-400" />
            <span className="text-xs font-bold">{user?.name}</span>
            <span className="text-[10px] text-blue-500 font-black uppercase ml-1 px-1.5 py-0.5 bg-blue-50 rounded">
              Code: {user?.orgCode || user?.orgId?.toString().slice(-6).toUpperCase()}
            </span>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: Hidden on mobile if a ticket is selected */}
        <aside className={`
          absolute inset-0 z-10 w-full bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300
          lg:relative lg:translate-x-0 lg:w-80
          ${selectedTicket ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
        `}>
          <div className="p-3 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Queue</span>
            <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-sm">{tickets.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TicketQueue
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelect={(id) => setSelectedTicket(id)}
              currentUser={user}
            />
          </div>
        </aside>

        {/* Chat Detail Space: Full screen on mobile if selected */}
        <section className={`
          flex-1 bg-white overflow-hidden relative transition-transform duration-300
          ${!selectedTicket ? "translate-x-full lg:translate-x-0" : "translate-x-0"}
        `}>
          {selectedTicket ? (
            <TicketDetail ticketId={selectedTicket} onUpdate={fetchTickets} />
          ) : (
            <div className="hidden lg:flex h-full flex-col items-center justify-center text-gray-400 space-y-2">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                <User size={20} className="text-gray-200" />
              </div>
              <p className="text-xs font-medium uppercase tracking-tight">Select a session from the queue</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AgentDashboard;