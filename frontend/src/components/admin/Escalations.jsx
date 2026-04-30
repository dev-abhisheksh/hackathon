import { useState, useEffect } from "react";
import api from "../../services/api";
import TicketQueue from "../agent/TicketQueue";
import TicketDetail from "../agent/TicketDetail";
import useSocket from "../../hooks/useSocket";

const Escalations = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [hideReply, setHideReply] = useState(false);

  const fetchEscalations = async () => {
    try {
      const res = await api.get("/tickets");
      const escalated = res.data.data.filter(t => t.category === "technical" || t.priority === "urgent");
      setTickets(escalated);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchEscalations(); }, []);
  useSocket("new_ticket", fetchEscalations);
  useSocket("ticket_updated", fetchEscalations);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(99vh-120px)] min-h-[calc(99vh-120px)] animate-in fade-in duration-500">
      <div className="w-full lg:w-72 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0 h-[30vh] lg:h-auto">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Critical Queue
          </h2>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={hideReply} 
              onChange={(e) => setHideReply(e.target.checked)}
              className="rounded border-gray-300 text-slate-900 focus:ring-slate-900 w-3 h-3"
            />
            <span className="text-[10px] font-bold text-gray-500 uppercase">Hide Reply</span>
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TicketQueue tickets={tickets} selectedTicket={selectedTicket} onSelect={setSelectedTicket} />
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[60vh] lg:h-auto">
        {selectedTicket ? (
          <TicketDetail ticketId={selectedTicket} onUpdate={fetchEscalations} hideReply={hideReply} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 p-4 text-center">
            <p className="text-sm font-bold text-gray-500">No Ticket Selected</p>
            <p className="text-xs mt-1">Select an escalated ticket from the queue to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Escalations;