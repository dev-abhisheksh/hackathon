import { useState, useEffect } from "react";
import api from "../../services/api";
import ReplyBox from "./ReplyBox";
import { useAuth } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";

const TicketDetail = ({ ticketId, onUpdate }) => {
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
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{ticket.subject}</h2>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>Customer: {ticket.customerId?.name}</span>
              <span className="capitalize">Category: {ticket.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isClosed && (
              <button 
                onClick={escalateTicket}
                disabled={ticket.category === 'technical' || ticket.priority === 'urgent'}
                className={`text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors shadow-sm ${(ticket.category === 'technical' || ticket.priority === 'urgent') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                title="Send to Admin Escalations Queue"
              >
                {(ticket.category === 'technical' || ticket.priority === 'urgent') ? 'Escalated' : 'Escalate'}
              </button>
            )}
            <select 
              value={ticket.status} 
              onChange={(e) => updateStatus(e.target.value)}
              disabled={isClosed}
              className={`text-sm border rounded p-1.5 outline-none focus:ring-2 focus:ring-blue-500 ${isClosed ? 'opacity-60 cursor-not-allowed bg-gray-200 text-gray-600' : 'bg-white shadow-sm'}`}
              title={isClosed ? "Ticket is locked" : "Change Status"}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
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

      <div className="p-4 border-t bg-white h-1/3">
        {isClosed ? (
          <div className="flex items-center justify-center h-full flex-col text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-gray-500 font-medium">This ticket has been marked as <span className="uppercase font-bold tracking-wide">{ticket.status}</span>.</span>
            <span className="text-gray-400 text-sm mt-1">No further actions can be taken.</span>
          </div>
        ) : (
          <ReplyBox ticket={ticket} onReplySent={fetchTicket} />
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
