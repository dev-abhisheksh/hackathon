import { useState } from "react";
import api from "../../services/api";
import { PlusCircle } from "lucide-react";

const TicketForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ subject: "", category: "general", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/tickets", formData);
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 border-b border-gray-100 bg-white shrink-0 flex items-center gap-2">
        <PlusCircle className="text-blue-500" size={18} />
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Create New Ticket</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Subject</label>
              <input 
                type="text" 
                required 
                placeholder="Briefly summarize your issue..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:border-blue-500 focus:bg-white outline-none text-sm transition-all"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Category</label>
              <select 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:border-blue-500 focus:bg-white outline-none text-sm transition-all cursor-pointer"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="general">General Inquiry</option>
                <option value="billing">Billing & Subscriptions</option>
                <option value="technical">Technical Support</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
              <textarea 
                required 
                rows="8"
                placeholder="Please provide as much detail as possible..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:border-blue-500 focus:bg-white outline-none text-sm transition-all resize-none leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {loading ? "Submitting Request..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
