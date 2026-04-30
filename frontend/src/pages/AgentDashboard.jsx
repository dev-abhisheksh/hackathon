import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import TicketQueue from "../components/agent/TicketQueue";
import TicketDetail from "../components/agent/TicketDetail";
import { LogOut } from "lucide-react";

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
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

  useSocket("new_ticket", (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  });

  useSocket("ticket_updated", () => {
    fetchTickets();
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Agent Workspace</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Agent: {user?.name}</span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 flex items-center gap-1">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex gap-6">
        <div className="w-1/3 bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-100px)]">
          <TicketQueue tickets={tickets} selectedTicket={selectedTicket} onSelect={setSelectedTicket} />
        </div>

        <div className="w-2/3 bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-100px)]">
          {selectedTicket ? (
            <TicketDetail ticketId={selectedTicket} onUpdate={fetchTickets} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a ticket from the queue
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
