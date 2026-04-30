import { useState, useEffect } from "react";
import api from "../../services/api";

const ReplyBox = ({ ticket, onReplySent }) => {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket.aiSuggestedReply && ticket.status === 'open') {
      setReply(ticket.aiSuggestedReply);
    } else {
      setReply("");
    }
  }, [ticket._id, ticket.aiSuggestedReply, ticket.status]);

  const handleSend = async (isAiGenerated = false) => {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await api.post(`/tickets/${ticket._id}/reply`, { content: reply, isAiGenerated });
      setReply("");
      onReplySent();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Reply</h3>
        {ticket.aiSuggestedReply && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              AI Suggestion
              <span className={`w-2 h-2 rounded-full ${ticket.confidence >= 75 ? 'bg-green-500' : ticket.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
              {ticket.confidence}%
            </span>
          </div>
        )}
      </div>
      <textarea 
        className="flex-1 w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none mb-2"
        placeholder="Type your reply here..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      ></textarea>
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => setReply(ticket.aiSuggestedReply || "")}
          className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50"
          disabled={!ticket.aiSuggestedReply || loading}
        >
          Reset to AI
        </button>
        <button 
          onClick={() => handleSend(reply === ticket.aiSuggestedReply)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading || !reply.trim()}
        >
          {loading ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;
