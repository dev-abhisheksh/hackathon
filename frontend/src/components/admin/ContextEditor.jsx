import { useState, useEffect } from "react";
import api from "../../services/api";

const ContextEditor = () => {
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await api.get("/admin/context");
        setPrompt(res.data.data.systemPrompt);
      } catch (error) {
        console.error(error);
      }
    };
    fetchContext();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.patch("/admin/context", { systemPrompt: prompt });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to save context");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-[calc(100vh-160px)]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">AI Context Instructions</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-3xl leading-relaxed">
            Define how the AI should behave, what knowledge it has about your organization, and what tone it should use when drafting replies or categorizing tickets. These instructions form the core prompt for the LLaMA3 model.
          </p>
        </div>

        <div className="flex-1 relative flex flex-col min-h-0 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">System Prompt</label>
          <textarea
            className="flex-1 w-full p-5 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm leading-relaxed text-gray-800 transition-all shadow-inner"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. You are a helpful support agent for Acme Corp. Acme Corp sells cloud hosting. We do not offer refunds after 30 days..."
          ></textarea>
        </div>

        <div className="flex justify-between items-center shrink-0 border-t border-gray-100 pt-6">
          <div className="text-sm text-gray-400 font-medium">Changes take effect immediately for all new tickets.</div>
          <div className="flex items-center gap-4">
            {success && <span className="text-emerald-600 text-sm font-semibold animate-pulse bg-emerald-50 px-3 py-1 rounded-full">Context updated successfully!</span>}
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? "Saving Changes..." : "Save AI Instructions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextEditor;
