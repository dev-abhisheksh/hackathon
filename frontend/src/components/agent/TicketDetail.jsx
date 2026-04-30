import { useState, useEffect } from "react";
import api from "../../services/api";
import ReplyBox from "./ReplyBox";
import { useAuth } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";

const TicketDetail = ({ ticketId, onUpdate, hideReply = false }) => {
  const [ticketData, setTicketData] = useState(null);
  const { user } = useAuth();
  const socket = useSocketContext();

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      setTicketData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      if (socket) {
        socket.emit("join_ticket", { ticketId });
      }
    }
  }, [ticketId, socket]);

  useSocket("new_message", (newMessage) => {
    if (newMessage.ticketId === ticketId) {
      setTicketData((prev) => {
        if (!prev) return prev;
        // avoid duplicate messages if the sender gets the socket event
        const exists = prev.messages.find(m => m._id === newMessage._id);
        if (exists) return prev;
        return { ...prev, messages: [...prev.messages, newMessage] };
      });
    }
  });

  useSocket("ticket_updated", (updated) => {
    // updated can be the ticket object or just the ID string
    const id = typeof updated === 'string' ? updated : updated._id;
    if (id === ticketId) {
      fetchTicket();
    }
  });

  const updateStatus = async (status) => {
    try {
      await api.patch(`/tickets/${ticketId}`, { status });
      fetchTicket();
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const escalateTicket = async () => {
    try {
      await api.patch(`/tickets/${ticketId}`, { category: "technical", priority: "urgent" });
      fetchTicket();
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  if (!ticketData) return <div className="p-8 text-center text-gray-500">Loading ticket...</div>;

  const { ticket, messages } = ticketData;

  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shrink-0">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900 truncate" title={ticket.subject}>{ticket.subject}</h2>
          <div className="flex gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="truncate">User: {ticket.customerId?.name}</span>
            <span className="truncate">Cat: {ticket.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isClosed && (
            <button 
              onClick={escalateTicket}
              disabled={ticket.category === 'technical' || ticket.priority === 'urgent'}
              className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider transition-colors shadow-sm ${(ticket.category === 'technical' || ticket.priority === 'urgent') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
              title="Send to Admin Escalations Queue"
            >
              {(ticket.category === 'technical' || ticket.priority === 'urgent') ? 'Escalated' : 'Escalate'}
            </button>
          )}
          <select 
            value={ticket.status} 
            onChange={(e) => updateStatus(e.target.value)}
            disabled={isClosed}
            className={`text-xs font-semibold border border-gray-200 rounded p-1 outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 ${isClosed ? 'opacity-60 cursor-not-allowed bg-gray-100 text-gray-500' : 'bg-white text-slate-900 shadow-sm'}`}
            title={isClosed ? "Ticket is locked" : "Change Status"}
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg._id} className={`flex ${msg.senderRole === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.senderRole === 'customer' ? 'bg-white shadow rounded-tl-none border border-gray-100' : 
              msg.isAiGenerated ? 'bg-purple-600 text-white rounded-tr-none' : 
              'bg-blue-600 text-white rounded-tr-none'
            }`}>
              <div className={`text-xs mb-1 ${msg.senderRole === 'customer' ? 'text-gray-500 font-medium capitalize' : 'text-blue-100'}`}>
                {msg.senderRole === 'customer' ? ticket.customerId?.name : msg.isAiGenerated ? 'AI Assistant' : 'Agent'}
              </div>
              <p className={`text-sm whitespace-pre-wrap ${msg.senderRole === 'customer' ? 'text-gray-800' : 'text-white'}`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!hideReply && (
        <div className="p-4 border-t bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
          {isClosed ? (
            <div className="flex items-center justify-center py-4 flex-col text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-gray-500 text-sm font-medium">This ticket is <span className="uppercase font-bold tracking-wide">{ticket.status}</span>.</span>
            </div>
          ) : (
            <div className="max-h-[30vh] overflow-y-auto">
              <ReplyBox ticket={ticket} onReplySent={fetchTicket} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
