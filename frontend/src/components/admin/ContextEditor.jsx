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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-3xl">
      <h2 className="text-xl font-bold mb-2">AI Context Instructions</h2>
      <p className="text-gray-500 text-sm mb-6">
        Define how the AI should behave, what knowledge it has about your organization, and what tone it should use when drafting replies or categorizing tickets.
      </p>

      <textarea
        rows="12"
        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm mb-4"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. You are a helpful support agent for Acme Corp. Acme Corp sells cloud hosting. We do not offer refunds after 30 days..."
      ></textarea>

      <div className="flex justify-end items-center gap-4">
        {success && <span className="text-green-600 text-sm font-medium">Context updated successfully!</span>}
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save AI Instructions"}
        </button>
      </div>
    </div>
  );
};

export default ContextEditor;
