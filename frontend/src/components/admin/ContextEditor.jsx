import { useState, useEffect } from "react";
import api from "../../services/api";
import { Save, Terminal } from "lucide-react";

const ContextEditor = () => {
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await api.get("/admin/context");
        setPrompt(res.data.data.systemPrompt);
      } catch (error) { console.error(error); }
    };
    fetchContext();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/admin/context", { systemPrompt: prompt });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl h-[calc(99vh-120px)] flex flex-col animate-in fade-in duration-500">
      <div className="bg-white border border-gray-200 rounded-lg flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-md">
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">System Behavior</h2>
              <p className="text-xs text-gray-500 mt-1">Configure AI logic and organizational boundaries.</p>
            </div>
          </div>
          {success && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UPDATED</span>}
        </div>

        <div className="p-6 flex flex-col flex-1 min-h-0">
          <textarea
            className="flex-1 w-full p-4 bg-slate-50 border border-gray-200 rounded-md focus:border-slate-900 outline-none font-mono text-xs leading-relaxed text-slate-800 transition-all resize-none shadow-inner"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="mt-6 flex items-center justify-end border-t border-gray-100 pt-6 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-md font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Processing..." : "Deploy Config"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextEditor;