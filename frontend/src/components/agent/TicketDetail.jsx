import { useState, useEffect } from "react";
import api from "../../services/api";
import ReplyBox from "./ReplyBox";
import { useAuth } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";
import { ShieldAlert, CheckCircle2, Lock } from "lucide-react";

const TicketDetail = ({ ticketId, onUpdate, hideReply = false }) => {
  const [ticketData, setTicketData] = useState(null);
  const { user } = useAuth();
  const socket = useSocketContext();

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      setTicketData(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      if (socket) socket.emit("join_ticket", { ticketId });
    }
  }, [ticketId, socket]);

  useSocket("new_message", (msg) => {
    if (msg.ticketId === ticketId) {
      setTicketData((prev) => {
        if (!prev || prev.messages.find(m => m._id === msg._id)) return prev;
        return { ...prev, messages: [...prev.messages, msg] };
      });
    }
  });

  const [liveCustomerText, setLiveCustomerText] = useState("");
  const [typingTimeoutState, setTypingTimeoutState] = useState(null);

  useSocket("customer_is_typing", ({ text }) => {
    setLiveCustomerText(text);
    if (typingTimeoutState) clearTimeout(typingTimeoutState);
    
    const timeout = setTimeout(() => {
      setLiveCustomerText("");
    }, 3000);
    setTypingTimeoutState(timeout);
  });

  const updateStatus = async (status) => {
    try {
      await api.patch(`/tickets/${ticketId}`, { status });
      fetchTicket();
      onUpdate();
    } catch (error) { console.error(error); }
  };

  const escalateTicket = async () => {
    try {
      await api.patch(`/tickets/${ticketId}`, { category: "technical", priority: "urgent" });
      fetchTicket();
      onUpdate();
    } catch (error) { console.error(error); }
  };

  if (!ticketData) return <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400 animate-pulse">CONNECTING...</div>;

  const { ticket, messages } = ticketData;
  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Compact Ticket Header */}
      <div className="px-4 h-14 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{ticket.subject}</h2>
            <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 font-bold uppercase">{ticket.category}</span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">Session: {ticket.customerId?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <button
              onClick={escalateTicket}
              disabled={ticket.category === 'technical' || ticket.priority === 'urgent'}
              className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase transition-all bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShieldAlert size={12} />
              {ticket.category === 'technical' ? 'Escalated' : 'Escalate'}
            </button>
          )}
          <select
            value={ticket.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={isClosed}
            className="text-[10px] font-bold border border-gray-200 rounded-md p-1.5 bg-gray-50 outline-none cursor-pointer uppercase tracking-wider"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress </option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {messages.map(msg => (
          <div key={msg._id} className={`flex ${msg.senderRole === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-md px-3 py-2 border shadow-sm ${msg.senderRole === 'customer'
              ? 'bg-white border-gray-200 text-slate-800'
              : msg.isAiGenerated
                ? 'bg-slate-800 border-slate-900 text-white'
                : 'bg-slate-900 border-slate-900 text-white'
              }`}>
              <div className={`text-[9px] font-black uppercase mb-1 tracking-tighter ${msg.senderRole === 'customer' ? 'text-gray-400' : 'text-slate-400'}`}>
                {msg.senderRole === 'customer' ? 'Customer' : msg.isAiGenerated ? 'System-AI' : 'Agent'}
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Section */}
      {!hideReply && (
        <div className="p-3 border-t border-gray-200 bg-white shrink-0">
          {isClosed ? (
            <div className="flex items-center justify-center p-3 gap-2 bg-gray-50 border border-dashed border-gray-200 rounded-md">
              <Lock size={14} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Thread locked: {ticket.status}</span>
            </div>
          ) : (
            <ReplyBox ticket={ticket} onReplySent={fetchTicket} liveCustomerText={liveCustomerText} />
          )}
        </div>
      )}
    </div>
  );
};

export default TicketDetail;