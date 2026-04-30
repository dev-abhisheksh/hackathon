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

  if (!ticketData) return <div className="p-8 text-center text-gray-500">Loading ticket...</div>;

  const { ticket, messages } = ticketData;

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
          <select 
            value={ticket.status} 
            onChange={(e) => updateStatus(e.target.value)}
            className="text-sm border rounded p-1 outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="p-4 border-t bg-white h-1/3">
        <ReplyBox ticket={ticket} onReplySent={fetchTicket} />
      </div>
    </div>
  );
};

export default TicketDetail;
