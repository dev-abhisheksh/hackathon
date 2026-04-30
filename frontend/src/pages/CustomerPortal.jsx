import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TicketForm from "../components/customer/TicketForm";
import TicketThread from "../components/customer/TicketThread";
import { LogOut } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Support Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name}</span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 flex items-center gap-1">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex gap-6">
        <div className="w-1/3 bg-white rounded-lg shadow flex flex-col h-[calc(100vh-100px)]">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-lg">Your Tickets</h2>
            <button 
              onClick={() => { setShowForm(true); setSelectedTicket(null); }}
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
            >
              + New
            </button>
          </div>
          <div className="overflow-y-auto p-4 flex-1">
            {tickets.length === 0 ? (
              <p className="text-gray-500 text-center text-sm mt-10">No tickets found.</p>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket._id} 
                  onClick={() => { setSelectedTicket(ticket._id); setShowForm(false); }}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${selectedTicket === ticket._id ? "bg-blue-50 border-blue-500 border-l-4" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate">{ticket.subject}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{ticket.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-2/3 bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-100px)]">
          {showForm ? (
            <TicketForm onSuccess={() => { setShowForm(false); fetchTickets(); }} />
          ) : selectedTicket ? (
            <TicketThread ticketId={selectedTicket} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a ticket or create a new one
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;
