"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Ban, Trash2, Shield, Camera, User,
  CheckCircle, RefreshCw, UserX, Edit2, X, Save,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { createClient } from "@supabase/supabase-js";

type UserRow = {
  _id: string; name: string; email: string;
  role: string; plan: string; createdAt: string; banned: boolean;
};

const ROLE_COLORS: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  admin:        { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   icon: <Shield size={11} /> },
  photographer: { color: "#FF2D78", bg: "rgba(255,45,120,0.1)",  icon: <Camera size={11} /> },
  user:         { color: "#6366F1", bg: "rgba(99,102,241,0.1)",  icon: <User size={11} /> },
};

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  free:   { color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
  pro:    { color: "#FF2D78", bg: "rgba(255,45,120,0.1)" },
  studio: { color: "#A855F7", bg: "rgba(168,85,247,0.1)" },
};

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [editUser, setEditUser]     = useState<UserRow | null>(null);
  const [editRole, setEditRole]     = useState("");
  const [editPlan, setEditPlan]     = useState("");

  const load = () => {
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 🔄 Loading users from API...`);
    
    api.get("/admin/users")
      .then(r => {
        console.log(`[${timestamp}] ✅ API Response received:`, r.data);
        const usersData = (r.data as { users: UserRow[] }).users;
        console.log(`[${timestamp}] 📊 Users loaded: ${usersData.length} total`);
        setUsers(usersData);
        
        if (usersData.length === 0) {
          toast.error("No users found in Supabase. Add users in database.");
        } else {
          // Show subtle toast on update (only if not initial load)
          if (users.length > 0 && usersData.length !== users.length) {
            const diff = usersData.length - users.length;
            toast.success(`Users updated: ${diff > 0 ? '+' : ''}${diff} (${usersData.length} total)`, { duration: 2000 });
            console.log(`[${timestamp}] 🎉 User count changed: ${users.length} → ${usersData.length}`);
          }
        }
      })
      .catch(err => {
        console.error(`[${timestamp}] ❌ API Error:`, err);
        toast.error("Failed to load users: " + (err.response?.data?.message || err.message));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    load(); 
    
    // Fast auto-refresh every 2 seconds for near-instant updates
    const interval = setInterval(() => {
      load();
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    
    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'new-user-registered') {
        console.log('New user registration detected via storage event!');
        load(); // Immediately reload
        localStorage.removeItem('new-user-registered'); // Clean up
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage periodically (for same-tab updates)
    const storageCheckInterval = setInterval(() => {
      if (localStorage.getItem('new-user-registered')) {
        console.log('New user registration detected!');
        load();
        localStorage.removeItem('new-user-registered');
      }
    }, 500); // Check every 500ms
    
    // Supabase Realtime subscription for INSTANT updates
    let realtimeChannel: any = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      console.log('🔴 Supabase Realtime: Connecting...');
      const realtimeClient = createClient(supabaseUrl, supabaseAnonKey);
      
      realtimeChannel = realtimeClient
        .channel('users-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users'
          },
          (payload) => {
            console.log('🔴 Supabase Realtime: User change detected!', payload.eventType);
            load(); // INSTANT reload
            toast.success('User list updated!', { duration: 2000 });
          }
        )
        .subscribe((status) => {
          console.log('🔴 Supabase Realtime status:', status);
        });
    } else {
      console.warn('⚠️ Supabase Realtime: Not available (missing anon key)');
    }
    
    return () => {
      clearInterval(interval);
      clearInterval(storageCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      
      if (realtimeChannel) {
        console.log('🔴 Supabase Realtime: Disconnecting...');
        realtimeChannel.unsubscribe();
      }
    };
  }, []);

  const toggleBan = async (user: UserRow) => {
    setActionId(user._id);
    try {
      await api.patch(`/admin/users/${user._id}`, { banned: !user.banned });
      
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, banned: !u.banned } : u));
      toast.success(user.banned ? `${user.name} unbanned` : `${user.name} banned`);
    } catch (err) {
      console.error("Ban toggle failed:", err);
      toast.error("Action failed");
    } finally {
      setActionId(null);
    }
  };

  const deleteUser = async (user: UserRow) => {
    setActionId(user._id);
    try {
      await api.delete(`/admin/users/${user._id}`);
      
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast.success(`${user.name} deleted`);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed");
    } finally {
      setActionId(null);
      setConfirmDelete(null);
    }
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setActionId(editUser._id);
    try {
      await api.patch(`/admin/users/${editUser._id}`, { role: editRole, plan: editPlan });
      
      setUsers(prev => prev.map(u => u._id === editUser._id ? { ...u, role: editRole, plan: editPlan } : u));
      toast.success("User updated");
      setEditUser(null);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Update failed");
    } finally {
      setActionId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter ||
                        (roleFilter === "banned" && u.banned);
    return matchSearch && matchRole;
  });

  const counts = {
    all:          users.length,
    photographer: users.filter(u => u.role === "photographer").length,
    admin:        users.filter(u => u.role === "admin").length,
    banned:       users.filter(u => u.banned).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-deep tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} registered · {counts.banned} banned</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-deep transition-colors"
          style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "all",          label: "All",           count: counts.all },
          { key: "photographer", label: "Photographers", count: counts.photographer },
          { key: "admin",        label: "Admins",        count: counts.admin },
          { key: "banned",       label: "Banned",        count: counts.banned },
        ].map(tab => (
          <button key={tab.key} onClick={() => setRoleFilter(tab.key)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
            style={roleFilter === tab.key
              ? { background: "linear-gradient(135deg,#EF4444,#F97316)", color: "white", boxShadow: "0 2px 12px rgba(239,68,68,0.25)" }
              : { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }
            }>
            {tab.label}
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
              style={roleFilter === tab.key
                ? { background: "rgba(255,255,255,0.25)", color: "white" }
                : { background: "#E2E8F0", color: "#64748B" }
              }>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white text-deep placeholder:text-slate-400 focus:outline-none transition-all"
          style={{ border: "1.5px solid rgba(239,68,68,0.15)" }}
          onFocus={e => (e.target.style.borderColor = "#EF4444")}
          onBlur={e => (e.target.style.borderColor = "rgba(239,68,68,0.15)")} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(239,68,68,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(239,68,68,0.08)", background: "#FAFBFC" }}>
                {["User", "Role", "Plan", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(239,68,68,0.05)" }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded-lg skeleton" style={{ width: j === 0 ? 140 : 80 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">No users match your search</td></tr>
              ) : filtered.map((user, i) => {
                const rc   = ROLE_COLORS[user.role] ?? ROLE_COLORS.user;
                const pc   = PLAN_COLORS[user.plan] ?? PLAN_COLORS.free;
                const busy = actionId === user._id;
                return (
                  <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="transition-colors" style={{ borderBottom: "1px solid rgba(239,68,68,0.05)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFBFC")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: user.banned ? "#94A3B8" : "linear-gradient(135deg,#EF4444,#F97316)" }}>
                          {user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-deep truncate flex items-center gap-1.5">
                            {user.name}
                            {user.banned && <UserX size={12} className="text-red-400 flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                        style={{ color: rc.color, background: rc.bg }}>
                        {rc.icon} {user.role}
                      </span>
                    </td>
                    {/* Plan */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                        style={{ color: pc.color, background: pc.bg }}>
                        {user.plan ?? "free"}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={user.banned
                          ? { color: "#EF4444", background: "rgba(239,68,68,0.1)" }
                          : { color: "#10B981", background: "rgba(16,185,129,0.1)" }}>
                        {user.banned ? <><UserX size={10} /> Banned</> : <><CheckCircle size={10} /> Active</>}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* Edit */}
                        <button onClick={() => { setEditUser(user); setEditRole(user.role); setEditPlan(user.plan ?? "free"); }}
                          disabled={busy}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                          style={{ background: "rgba(99,102,241,0.08)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.15)" }}>
                          <Edit2 size={11} /> Edit
                        </button>
                        {/* Ban */}
                        <button onClick={() => toggleBan(user)} disabled={busy || user.role === "admin"}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={user.banned
                            ? { background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }
                            : { background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}>
                          {busy ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <Ban size={11} />}
                          {user.banned ? "Unban" : "Ban"}
                        </button>
                        {/* Delete */}
                        <button onClick={() => setConfirmDelete(user)} disabled={busy || user.role === "admin"}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: "rgba(239,68,68,0.06)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.12)" }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 text-xs text-slate-400" style={{ borderTop: "1px solid rgba(239,68,68,0.06)" }}>
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setEditUser(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-lg text-deep">Edit User</h3>
                <button onClick={() => setEditUser(null)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><X size={16} /></button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl mb-5"
                style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#EF4444,#F97316)" }}>
                  {editUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm text-deep">{editUser.name}</div>
                  <div className="text-xs text-slate-400">{editUser.email}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Role</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-deep focus:outline-none"
                    style={{ border: "1.5px solid rgba(239,68,68,0.2)", background: "#FAFBFC" }}>
                    <option value="photographer">Photographer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Plan</label>
                  <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-deep focus:outline-none"
                    style={{ border: "1.5px solid rgba(239,68,68,0.2)", background: "#FAFBFC" }}>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600"
                  style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>Cancel</button>
                <button onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#EF4444,#F97316)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="font-black text-lg text-deep text-center mb-1">Delete User?</h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                <strong>{confirmDelete.name}</strong> ({confirmDelete.email}) will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600"
                  style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>Cancel</button>
                <button onClick={() => deleteUser(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#EF4444,#F87171)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


