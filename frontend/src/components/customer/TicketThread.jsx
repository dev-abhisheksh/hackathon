import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import useSocket from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";
import { Send, Lock } from "lucide-react";

const TicketThread = ({ ticketId }) => {
  const [ticketData, setTicketData] = useState(null);
  const [reply, setReply] = useState("");
  const socket = useSocketContext();
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketData?.messages]);

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

  if (!ticketData) return <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">CONNECTING...</div>;

  const { ticket, messages } = ticketData;
  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 md:px-6 h-16 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
        <div className="min-w-0 pr-4">
          <h2 className="text-sm font-bold text-slate-900 truncate tracking-tight">{ticket.subject}</h2>
          <div className="flex gap-3 mt-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            <span>ID: {ticket._id.slice(-6)}</span>
            <span className="flex items-center gap-1">
              Priority: <span className={ticket.priority === 'urgent' ? 'text-red-500' : 'text-slate-500'}>{ticket.priority}</span>
            </span>
          </div>
        </div>
        <span className={`shrink-0 text-[10px] px-2 py-1 rounded uppercase font-black tracking-tighter ${ticket.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
          {ticket.status}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
        {messages.map(msg => (
          <div key={msg._id} className={`flex ${msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-md px-4 py-3 border shadow-sm ${
              msg.senderRole === 'customer' 
                ? 'bg-blue-600 border-blue-700 text-white' 
                : 'bg-white border-gray-200 text-slate-800'
            }`}>
              <div className={`text-[9px] font-black uppercase mb-1.5 tracking-tighter ${msg.senderRole === 'customer' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.senderRole === 'customer' ? 'You' : 'Support Team'}
              </div>
              <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white shrink-0">
        {isClosed ? (
          <div className="flex items-center justify-center p-3 gap-2 bg-gray-50 border border-dashed border-gray-200 rounded-md">
            <Lock size={14} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Thread locked ({ticket.status})</span>
          </div>
        ) : (
          <form onSubmit={handleReply} className="flex flex-col gap-2 relative">
            <textarea 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs md:text-sm leading-relaxed transition-all resize-none h-20 md:h-24 pr-14"
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                if (socket) {
                  socket.emit("customer_typing", { ticketId, text: e.target.value });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply(e);
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!reply.trim()}
              className="absolute bottom-2 right-2 flex items-center justify-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              title="Send (Enter)"
            >
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TicketThread;
