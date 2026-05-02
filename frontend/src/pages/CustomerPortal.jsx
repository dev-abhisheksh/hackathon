import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TicketForm from "../components/customer/TicketForm";
import TicketThread from "../components/customer/TicketThread";
import { LogOut, Plus, ChevronLeft, Ticket as TicketIcon } from "lucide-react";
import useSocket from "../hooks/useSocket";

const CustomerPortal = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { user, logout } = useAuth();

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useSocket("ticket_updated", () => {
    fetchTickets();
  });

  useSocket("new_message", () => {
    fetchTickets();
  });

  const handleBack = () => {
    setSelectedTicket(null);
    setShowForm(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 md:px-6 py-3 flex justify-between items-center shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <TicketIcon className="text-blue-400" size={20} />
          <h1 className="text-lg font-bold tracking-tight">Nexus <span className="text-blue-400 font-black">Support</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-300 hidden sm:inline-block">Welcome, {user?.name}</span>
          <button onClick={logout} className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar: Ticket List */}
        <aside className={`
          absolute inset-0 z-10 w-full bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-80 lg:w-96
          ${(selectedTicket || showForm) ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
        `}>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Your Tickets</h2>
            <button 
              onClick={() => { setShowForm(true); setSelectedTicket(null); }}
              className="bg-blue-600 text-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={12} /> New
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 bg-slate-50/50">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <TicketIcon size={32} className="mb-2 opacity-20" />
                <p className="text-xs font-medium">No tickets found.</p>
                <p className="text-[10px]">Create one to get started.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket._id} 
                  onClick={() => { setSelectedTicket(ticket._id); setShowForm(false); }}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${selectedTicket === ticket._id ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "hover:bg-white border-l-4 border-l-transparent"}`}
                >
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <span className="font-bold text-xs text-slate-800 truncate leading-tight">{ticket.subject}</span>
                    <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter ${ticket.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{ticket.description}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <section className={`
          flex-1 bg-white overflow-hidden relative flex flex-col transition-transform duration-300 ease-in-out
          ${!(selectedTicket || showForm) ? "translate-x-full md:translate-x-0" : "translate-x-0"}
        `}>
          {/* Mobile Back Button Header */}
          <div className="md:hidden p-3 border-b border-gray-200 bg-white flex items-center shrink-0">
            <button 
              onClick={handleBack}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider"
            >
              <ChevronLeft size={16} /> Back to List
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {showForm ? (
              <TicketForm onSuccess={() => { setShowForm(false); fetchTickets(); }} />
            ) : selectedTicket ? (
              <TicketThread ticketId={selectedTicket} />
            ) : (
              <div className="hidden md:flex h-full flex-col items-center justify-center text-slate-300 bg-slate-50">
                <TicketIcon size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium tracking-wide">Select a ticket or create a new one</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default CustomerPortal;
