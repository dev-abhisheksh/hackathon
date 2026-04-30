import { useState, useEffect } from "react";
import api from "../../services/api";
import { Sparkles, Send, RotateCcw } from "lucide-react";

const ReplyBox = ({ ticket, onReplySent }) => {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket.aiSuggestedReply && ticket.status === 'open') {
      setReply(ticket.aiSuggestedReply);
    } else { setReply(""); }
  }, [ticket._id, ticket.aiSuggestedReply, ticket.status]);

  const handleSend = async (isAiGenerated = false) => {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await api.post(`/tickets/${ticket._id}/reply`, { content: reply, isAiGenerated });
      setReply("");
      onReplySent();
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Message Terminal</span>
          {ticket.aiSuggestedReply && (
            <div className="flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
              <Sparkles size={10} className="text-indigo-600" />
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter">AI Ready ({ticket.confidence}%)</span>
            </div>
          )}
        </div>
      </div>

      <textarea
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs leading-relaxed transition-all resize-none h-24"
        placeholder="Input response sequence..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setReply(ticket.aiSuggestedReply || "")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight text-gray-500 hover:text-slate-900 transition-colors disabled:opacity-20"
          disabled={!ticket.aiSuggestedReply || loading}
        >
          <RotateCcw size={12} /> Sync AI
        </button>
        <button
          onClick={() => handleSend(reply === ticket.aiSuggestedReply)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          disabled={loading || !reply.trim()}
        >
          <Send size={12} />
          {loading ? "Transmitting..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;