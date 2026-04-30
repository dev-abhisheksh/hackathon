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
    <div className="flex gap-6 h-[calc(100vh-160px)]">
      <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-red-800">Escalated Tickets</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {/* We reuse the Agent's TicketQueue UI */}
          <TicketQueue tickets={tickets} selectedTicket={selectedTicket} onSelect={setSelectedTicket} />
        </div>
      </div>

      <div className="w-2/3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {selectedTicket ? (
          <TicketDetail ticketId={selectedTicket} onUpdate={fetchEscalations} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select an escalated ticket to resolve
          </div>
        )}
      </div>
    </div>
  );
};

export default Escalations;
