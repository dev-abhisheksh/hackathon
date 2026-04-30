import { useState, useEffect } from "react";
import api from "../../services/api";
import useSocket from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";

const TicketThread = ({ ticketId }) => {
  const [ticketData, setTicketData] = useState(null);
  const [reply, setReply] = useState("");
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
        const exists = prev.messages.find(m => m._id === newMessage._id);
        if (exists) return prev;
        return { ...prev, messages: [...prev.messages, newMessage] };
      });
    }
  });

  useSocket("ticket_updated", (updated) => {
    const id = typeof updated === 'string' ? updated : updated._id;
    if (id === ticketId) {
      fetchTicket();
    }
  });

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await api.post(`/tickets/${ticketId}/reply`, { content: reply });
      setReply("");
      fetchTicket();
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
          <h2 className="text-lg font-bold">{ticket.subject}</h2>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{ticket.status}</span>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>Ticket ID: {ticket._id.slice(-6)}</span>
          <span className="capitalize">Priority: {ticket.priority}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg._id} className={`flex ${msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.senderRole === 'customer' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white shadow rounded-tl-none border border-gray-100'
            }`}>
              <div className={`text-xs mb-1 ${msg.senderRole === 'customer' ? 'text-blue-100' : 'text-gray-500 font-medium capitalize'}`}>
                {msg.senderRole}
              </div>
              <p className={`text-sm whitespace-pre-wrap ${msg.senderRole === 'customer' ? 'text-white' : 'text-gray-800'}`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white">
        <form onSubmit={handleReply} className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketThread;
