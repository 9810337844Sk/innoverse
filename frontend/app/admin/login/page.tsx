"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded admin credentials
    if (username === "photofly9090" && password === "admin@Sunway11") {
      setLoading(true);
      
      try {
        // Call the admin login API to create a proper session
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Set admin user in auth store
        setAuth({
          _id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          plan: data.user.plan || "free",
          avatar: data.user.avatar || null,
        });
        
        localStorage.setItem("admin_authenticated", "true");
        toast.success("Welcome Admin!");
        router.push("/admin");
      } catch (error) {
        console.error("Admin login error:", error);
        toast.error(error instanceof Error ? error.message : "Login failed");
        setLoading(false);
      }
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(145deg, #1A0A12 0%, #2D0F1E 50%, #1A0A12 100%)" }}>
      
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #EF4444 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #F97316 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md">
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl"
          style={{ border: "1px solid rgba(239,68,68,0.1)" }}>
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #EF4444, #F97316)", boxShadow: "0 8px 24px rgba(239,68,68,0.3)" }}>
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="font-black text-2xl text-deep tracking-tight mb-2">Admin Login</h1>
            <p className="text-slate-500 text-sm">PhotoFly Administration Panel</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                  style={{ background: "#FAFBFC", border: "1.5px solid rgba(239,68,68,0.15)", color: "#1A0A12" }}
                  onFocus={(e) => { e.target.style.borderColor = "#EF4444"; e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(239,68,68,0.15)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                  style={{ background: "#FAFBFC", border: "1.5px solid rgba(239,68,68,0.15)", color: "#1A0A12" }}
                  onFocus={(e) => { e.target.style.borderColor = "#EF4444"; e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(239,68,68,0.15)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #EF4444, #F97316)", boxShadow: "0 4px 20px rgba(239,68,68,0.3)" }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <><Shield size={16} /> Sign In as Admin</>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 rounded-xl flex items-start gap-3"
            style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
            <Shield size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              This is a secure admin area. Only authorized administrators with valid credentials can access this panel.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-xs">PhotoFly Administration © 2026</p>
        </div>
      </motion.div>
    </div>
  );
}
