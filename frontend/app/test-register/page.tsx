"use client";
import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/**
 * TEST REGISTRATION PAGE
 * For testing user registration without email verification
 * Access at: http://localhost:3000/test-register
 */
export default function TestRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "photographer",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/test-register", form);
      toast.success("Account created successfully!");
      console.log("Created user:", data.user);
      
      // Trigger admin panel refresh
      if (data.triggerAdminRefresh) {
        localStorage.setItem('new-user-registered', Date.now().toString());
      }
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FAFBFC" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Registration</h1>
            <p className="text-sm text-gray-500">
              No email verification required. For testing purposes only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="photographer">Photographer</option>
                <option value="user">Guest User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)" }}
            >
              {loading ? "Creating Account..." : "Create Test Account"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              ⚠️ This is a test endpoint. Use the normal registration flow for production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
