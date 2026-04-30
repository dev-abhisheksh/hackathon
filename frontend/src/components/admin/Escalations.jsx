import { useState, useEffect } from "react";
import api from "../../services/api";
import TicketQueue from "../agent/TicketQueue";
import TicketDetail from "../agent/TicketDetail";
import useSocket from "../../hooks/useSocket";

const Escalations = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchEscalations = async () => {
    try {
      // Fetch all tickets and filter escalated ones
      const res = await api.get("/tickets");
      const escalated = res.data.data.filter(t => t.category === "technical" || t.priority === "urgent");
      setTickets(escalated);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  useSocket("new_ticket", (newTicket) => {
    if (newTicket.category === "technical" || newTicket.priority === "urgent") {
      setTickets((prev) => [newTicket, ...prev]);
    }
  });

  useSocket("ticket_updated", () => {
    fetchEscalations();
  });

  return (
    <div className="flex gap-8 h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-5 bg-red-50 border-b border-red-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 w-2.5 h-2.5 rounded-full animate-pulse"></span>
            <h2 className="font-bold text-red-800 tracking-tight">Escalated Tickets</h2>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {/* We reuse the Agent's TicketQueue UI */}
          <TicketQueue tickets={tickets} selectedTicket={selectedTicket} onSelect={setSelectedTicket} />
        </div>
      </div>

      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {selectedTicket ? (
          <TicketDetail ticketId={selectedTicket} onUpdate={fetchEscalations} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium text-gray-500">Select an escalated ticket to resolve</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Escalations;
