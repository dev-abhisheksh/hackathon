import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Lock, Mail, AlertCircle, Ticket as TicketIcon } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      if (data.success) {
        if (data.data.role === "admin") navigate("/admin");
        else if (data.data.role === "agent") navigate("/agent");
        else navigate("/customer");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">

      <div className="w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex flex-col items-center shrink-0 gap-2">
          <TicketIcon className="text-blue-600" size={36} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nexus <span className="text-blue-600 font-black">Support</span></h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="p-6">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-900">Sign In</h2>
              <p className="text-[11px] text-gray-500 font-medium">Access authorized dashboard</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-md mb-4 text-[10px] font-bold italic">
                <AlertCircle size={12} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">
                  Identifier
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="email"
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs transition-all"
                    placeholder="email@nexus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">
                  Security Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="password"
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-bold py-2 rounded-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 text-xs mt-2"
              >
                {isLoading ? "Verifying..." : "Enter Terminal"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-500">
                New user?{" "}
                <Link to="/register" className="text-slate-900 font-bold hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-6 text-[8px] font-bold text-gray-300 uppercase tracking-[0.4em] text-center">
          Secured by Nexus v2.0
        </footer>
      </div>
    </div>
  );
};

export default Login;