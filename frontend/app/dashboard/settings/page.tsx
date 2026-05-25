"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  User, Mail, Lock, Bell, Shield, Palette,
  Save, Eye, EyeOff, CheckCircle, Camera,
  Smartphone, Globe, AlertTriangle, Clock3,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { DashboardTheme, useThemeStore } from "@/store/themeStore";
import Image from "next/image";

type Section = "profile" | "password" | "notifications" | "appearance" | "danger";

const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",       icon: <User size={16} /> },
  { id: "password",      label: "Password",      icon: <Lock size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "appearance",    label: "Appearance",    icon: <Palette size={16} /> },
  { id: "danger",        label: "Danger Zone",   icon: <Shield size={16} /> },
];

function SectionCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8"
      style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 4px 24px rgba(255,45,120,0.05)" }}>
      <div className="mb-6">
        <h2 className="font-bold text-lg text-deep">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-5" style={{ borderTop: "1px solid rgba(255,45,120,0.07)" }} />;
}

function Toggle({ checked, onChange, label, sub }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-deep">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
        style={{ background: checked ? "linear-gradient(135deg,#FF2D78,#FF6B9D)" : "#E2E8F0" }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [active, setActive] = useState<Section>("profile");

  // Profile form
  const [profile, setProfile] = useState({
    name:  user?.name  ?? "",
    email: user?.email ?? "",
    bio:   "",
    phone: "",
    website: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    emailSearches:   true,
    emailDownloads:  true,
    emailWeekly:     false,
    pushSearches:    true,
    pushDownloads:   false,
  });

  // Appearance
  const theme = useThemeStore(s => s.theme);
  const setTheme = useThemeStore(s => s.setTheme);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await new Promise(r => setTimeout(r, 800));
    setSavingProfile(false);
    toast.success("Profile updated!");
  };

  const uploadAvatar = async (file: File | undefined) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const result = await response.json() as { avatar?: string; message?: string };
      if (!response.ok || !result.avatar) throw new Error(result.message || "Upload failed");
      updateUser({ avatar: result.avatar });
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Profile photo upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.next.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPw(true);
    await new Promise(r => setTimeout(r, 800));
    setSavingPw(false);
    setPasswords({ current: "", next: "", confirm: "" });
    toast.success("Password changed!");
  };

  const themes: { id: DashboardTheme; label: string; preview: string }[] = [
    { id: "normal", label: "Normal", preview: "#FFFFFF" },
    { id: "dark", label: "Dark", preview: "#111827" },
    { id: "green", label: "Green", preview: "#DCFCE7" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-deep">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar nav */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="rounded-3xl bg-white p-3 sticky top-6"
            style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 4px 24px rgba(255,45,120,0.05)" }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all relative"
                style={active === s.id
                  ? { background: "rgba(255,45,120,0.07)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.12)" }
                  : { color: "#64748b" }}
              >
                <span style={{ color: active === s.id ? "#FF2D78" : "#94a3b8" }}>{s.icon}</span>
                {s.label}
                {s.id === "danger" && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">

          {/* ── Profile ── */}
          {active === "profile" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard title="Profile Information" desc="Update your name, email and public details.">
                {/* Avatar */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-2xl"
                      style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)" }}>
                      {user?.avatar ? (
                        <Image src={user.avatar} alt={`${user.name} profile`} width={80} height={80} className="h-full w-full object-cover" />
                      ) : (
                        user?.name?.[0] ?? "U"
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center bg-white cursor-pointer"
                      style={{ border: "1.5px solid rgba(255,45,120,0.2)", boxShadow: "0 2px 8px rgba(255,45,120,0.1)" }}>
                      {uploadingAvatar ? (
                        <span className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      ) : (
                        <Camera size={13} style={{ color: "#FF2D78" }} />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingAvatar}
                        onChange={e => void uploadAvatar(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <div>
                    <div className="font-semibold text-deep">{user?.name}</div>
                    <div className="text-slate-400 text-sm">{user?.email}</div>
                    <div className="mt-1">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                        style={{ background: "rgba(255,45,120,0.08)", color: "#FF2D78" }}>
                        {user?.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Upload a profile photo (max 5 MB)</p>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name" icon={<User size={15} />}
                      value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name" />
                    <Input label="Email" type="email" icon={<Mail size={15} />}
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Phone" icon={<Smartphone size={15} />}
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+977 98XXXXXXXX" />
                    <Input label="Website" icon={<Globe size={15} />}
                      value={profile.website}
                      onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://yoursite.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-deep/60 mb-2 uppercase tracking-wider">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell clients a little about yourself…"
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" loading={savingProfile}>
                      <Save size={14} /> Save Changes
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </motion.div>
          )}

          {/* ── Password ── */}
          {active === "password" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard title="Change Password" desc="Use a strong password of at least 8 characters.">
                <form onSubmit={savePassword} className="space-y-4 max-w-sm">
                  {(["current","next","confirm"] as const).map(field => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-deep/60 mb-2 uppercase tracking-wider">
                        {field === "current" ? "Current Password" : field === "next" ? "New Password" : "Confirm New Password"}
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock size={15} />
                        </div>
                        <input
                          type={showPw[field] ? "text" : "password"}
                          value={passwords[field]}
                          onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                          placeholder="••••••••"
                          className="input-field pl-11 pr-11"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Strength hint */}
                  {passwords.next && (
                    <div className="flex items-center gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                          style={{
                            background: passwords.next.length >= i * 3
                              ? i <= 1 ? "#ef4444" : i <= 2 ? "#f59e0b" : i <= 3 ? "#22c55e" : "#0D9488"
                              : "#E2E8F0"
                          }} />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">
                        {passwords.next.length < 4 ? "Weak" : passwords.next.length < 8 ? "Fair" : passwords.next.length < 12 ? "Good" : "Strong"}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" loading={savingPw}>
                      <Lock size={14} /> Update Password
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </motion.div>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <SectionCard title="Email Notifications" desc="Choose which emails you want to receive.">
                <Toggle checked={notifs.emailSearches} onChange={v => setNotifs(n => ({ ...n, emailSearches: v }))}
                  label="Guest searches" sub="Email when a guest finds their photos" />
                <Divider />
                <Toggle checked={notifs.emailDownloads} onChange={v => setNotifs(n => ({ ...n, emailDownloads: v }))}
                  label="Photo downloads" sub="Email when photos are downloaded" />
                <Divider />
                <Toggle checked={notifs.emailWeekly} onChange={v => setNotifs(n => ({ ...n, emailWeekly: v }))}
                  label="Weekly summary" sub="A weekly digest of your event activity" />
              </SectionCard>

              <SectionCard title="Push Notifications" desc="In-app and browser push alerts.">
                <Toggle checked={notifs.pushSearches} onChange={v => setNotifs(n => ({ ...n, pushSearches: v }))}
                  label="Real-time searches" sub="Instant alert when guests search" />
                <Divider />
                <Toggle checked={notifs.pushDownloads} onChange={v => setNotifs(n => ({ ...n, pushDownloads: v }))}
                  label="Download alerts" sub="Alert when photos are downloaded" />
              </SectionCard>

              <div className="flex justify-end">
                <Button onClick={() => toast.success("Notification preferences saved!")}>
                  <Save size={14} /> Save Preferences
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Appearance ── */}
          {active === "appearance" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard title="Appearance" desc="Customize how PhotoFly looks for you.">
                {/* Theme */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-deep/60 mb-3 uppercase tracking-wider">Theme</label>
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    {themes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                        style={theme === t.id
                          ? { background: "rgba(255,45,120,0.07)", border: "2px solid #FF2D78" }
                          : { background: "#F8FAFC", border: "2px solid transparent" }}
                      >
                        <div className="w-10 h-7 rounded-lg"
                          style={{ background: t.preview, border: "1px solid #E2E8F0" }} />
                        <span className="text-xs font-medium text-deep">{t.label}</span>
                        {theme === t.id && <CheckCircle size={13} style={{ color: "#FF2D78" }} />}
                      </button>
                    ))}
                  </div>
                </div>

              </SectionCard>
            </motion.div>
          )}

          {/* ── Danger Zone ── */}
          {active === "danger" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-3xl bg-white p-6 sm:p-8"
                style={{ border: "1.5px solid rgba(239,68,68,0.2)", boxShadow: "0 4px 24px rgba(239,68,68,0.06)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-deep">Danger Zone</h2>
                    <p className="text-slate-500 text-sm">Irreversible actions — proceed with caution.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Export data */}
                  <div className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div>
                      <div className="font-medium text-sm text-deep">Export your data</div>
                      <div className="text-xs text-slate-400 mt-0.5">Coming soon - download all your events and photos as a ZIP</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast("Export your data is coming soon")}>
                      <Clock3 size={13} /> Coming soon
                    </Button>
                  </div>

                  {/* Delete account */}
                  <div className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div>
                      <div className="font-medium text-sm text-red-600">Delete account</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Coming soon - permanently delete your account, events and photos
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast("Delete account is coming soon")}>
                      <Clock3 size={13} /> Coming soon
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
