import { useState, useEffect } from "react";
import api from "../../services/api";
import { Sparkles, Send, RotateCcw, Activity, Languages, Zap } from "lucide-react";

const ReplyBox = ({ ticket, onReplySent, liveCustomerText }) => {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLabel, setActionLabel] = useState("");

  useEffect(() => {
    if (ticket.aiSuggestedReply && ticket.status === 'open') {
      setReply(ticket.aiSuggestedReply);
    } else { setReply(""); }
  }, [ticket._id, ticket.aiSuggestedReply, ticket.status]);

  const handleSend = async (isAiGenerated = false) => {
    if (!reply.trim()) return;
    setLoading(true);
    setActionLabel("Transmitting...");
    try {
      await api.post(`/tickets/${ticket._id}/reply`, { content: reply, isAiGenerated });
      setReply("");
      onReplySent();
    } catch (error) { console.error(error); }
    finally { setLoading(false); setActionLabel(""); }
  };

  const handleTune = async (tone) => {
    if (!reply.trim()) return;
    setLoading(true);
    setActionLabel(`Tuning...`);
    try {
      const res = await api.post(`/tickets/${ticket._id}/tune`, { text: reply, tone });
      setReply(res.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setActionLabel(""); }
  };

  const handleTranslate = async (e) => {
    const targetLanguage = e.target.value;
    if (!targetLanguage || !reply.trim()) return;
    setLoading(true);
    setActionLabel(`Translating...`);
    try {
      const res = await api.post(`/tickets/${ticket._id}/translate`, { text: reply, targetLanguage });
      setReply(res.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setActionLabel(""); e.target.value = ""; } 
  };

  const handleLiveDraft = async () => {
    if (!liveCustomerText.trim()) return;
    setLoading(true);
    setActionLabel("Drafting...");
    try {
      const res = await api.post(`/tickets/${ticket._id}/live-draft`, { liveText: liveCustomerText });
      setReply(res.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setActionLabel(""); }
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

      {liveCustomerText && (
        <div className="flex items-start justify-between gap-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <Activity size={12} className="text-amber-600 animate-pulse shrink-0" />
            <span className="text-[10px] font-medium text-amber-800 truncate">
              <strong className="font-bold">Customer typing:</strong> "{liveCustomerText}"
            </span>
          </div>
          <button 
            onClick={handleLiveDraft}
            disabled={loading}
            className="shrink-0 flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-[9px] font-bold uppercase rounded border border-amber-300 transition-colors disabled:opacity-50"
          >
            <Zap size={10} /> Pre-Draft
          </button>
        </div>
      )}

      <textarea
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs leading-relaxed transition-all resize-none h-24"
        placeholder="Input response sequence..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        disabled={loading}
      />

      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2 items-center">
          <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200">
            <button disabled={loading || !reply.trim()} onClick={() => handleTune('professional')} className="px-2 py-1 text-[9px] font-bold uppercase text-gray-600 hover:bg-white hover:shadow-sm rounded disabled:opacity-30 transition-all">Pro</button>
            <button disabled={loading || !reply.trim()} onClick={() => handleTune('empathetic')} className="px-2 py-1 text-[9px] font-bold uppercase text-gray-600 hover:bg-white hover:shadow-sm rounded disabled:opacity-30 transition-all">Empathetic</button>
            <button disabled={loading || !reply.trim()} onClick={() => handleTune('shorter and more concise')} className="px-2 py-1 text-[9px] font-bold uppercase text-gray-600 hover:bg-white hover:shadow-sm rounded disabled:opacity-30 transition-all">Short</button>
          </div>
          
          <div className="relative">
            <Languages size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              disabled={loading || !reply.trim()}
              onChange={handleTranslate}
              className="pl-7 pr-2 py-1 text-[9px] font-bold uppercase bg-white border border-gray-200 rounded-md outline-none cursor-pointer disabled:opacity-30 hover:border-gray-300 transition-colors text-gray-600"
            >
              <option value="">Translate...</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
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
            {actionLabel || "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyBox;