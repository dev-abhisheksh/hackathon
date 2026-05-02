import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, User, Mail, Lock, Building, Briefcase, AlertCircle, Ticket as TicketIcon } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    orgName: "",
    orgCode: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await register(formData);
      if (data.success) {
        if (data.data.role === "admin") navigate("/admin");
        else if (data.data.role === "agent") navigate("/agent");
        else navigate("/customer");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">

      <div className="w-full max-w-[380px] animate-in fade-in zoom-in-95 duration-500 overflow-y-auto max-h-full no-scrollbar">
        <div className="mb-6 flex flex-col items-center shrink-0 gap-2">
          <TicketIcon className="text-blue-600" size={36} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nexus <span className="text-blue-600 font-black">Support</span></h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Create Account</h2>
              <p className="text-[11px] text-gray-500 font-medium">Join the enterprise network</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-md mb-4 text-[10px] font-bold">
                <AlertCircle size={12} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    name="name"
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs transition-all"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="email"
                    name="email"
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs transition-all"
                    placeholder="jane@nexus.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="password"
                    name="password"
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Role & Org Fields (Side-by-Side to save vertical space) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select
                      name="role"
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs transition-all appearance-none cursor-pointer"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="customer">Customer</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">
                    {formData.role === "admin" ? "Org Name" : "Org Code"}
                  </label>
                  <div className="relative">
                    <Building className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      name={formData.role === "admin" ? "orgName" : "orgCode"}
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:border-slate-900 focus:bg-white outline-none text-xs transition-all uppercase"
                      placeholder={formData.role === "admin" ? "Acme Corp" : "6-CHAR CODE"}
                      value={formData.role === "admin" ? formData.orgName : formData.orgCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-bold py-2 rounded-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 text-xs mt-4 shadow-sm"
              >
                {isLoading ? "Creating Profile..." : "Register Profile"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-500">
                Member already?{" "}
                <Link to="/login" className="text-slate-900 font-bold hover:underline underline-offset-4">
                  Access Portal
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* <footer className="mt-4 text-[8px] font-bold text-gray-300 uppercase tracking-[0.4em] text-center">
          Terminal Access Layer v2.0
        </footer> */}
      </div>
    </div>
  );
};

export default Register;