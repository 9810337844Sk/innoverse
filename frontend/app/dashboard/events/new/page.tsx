"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, Plus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type CreatedEvent = {
  _id?: string;
  name?: string;
  message?: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", date: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Event name is required");
      return;
    }
    if (!form.date) {
      setError("Event date is required");
      return;
    }

    setError("");
    setCreating(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), date: form.date }),
      });

      let json: CreatedEvent = {};
      try {
        json = (await res.json()) as CreatedEvent;
      } catch {
        json = {};
      }

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
        } else if (res.status === 403) {
          setError("Your account cannot create events.");
        } else {
          setError(json.message || `Server error (${res.status})`);
        }
        return;
      }

      toast.success("Event created");
      setForm({ name: "", date: "" });
      if (json._id) {
        router.replace(`/dashboard/events/${json._id}`);
      } else {
        router.replace("/dashboard/events");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft size={15} /> Back to events
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.12)" }}>
              <CalendarDays size={18} style={{ color: "#FF2D78" }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Photographer Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-deep">Create Event</h1>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.14)" }}>
          <Sparkles size={14} style={{ color: "#A855F7" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#A855F7" }}>New setup</span>
        </div>
      </div>

      <div
        className="rounded-3xl bg-white p-6 sm:p-7"
        style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
      >
        <div className="grid gap-5">
          <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "rgba(255,45,120,0.04)", border: "1px solid rgba(255,45,120,0.08)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,45,120,0.08)" }}>
              <CheckCircle2 size={15} style={{ color: "#FF2D78" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-deep">Create a new photo event</p>
              <p className="text-sm text-slate-500 mt-0.5">Set the name and date, then start uploading photos from the event page.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              ref={nameRef}
              label="Event Name"
              placeholder="e.g. Priya & Rahul's Wedding"
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError(""); }}
            />

            <Input
              label="Event Date"
              type="date"
              value={form.date}
              onChange={(e) => { setForm((p) => ({ ...p, date: e.target.value })); setError(""); }}
            />

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm text-red-600"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button variant="ghost" fullWidth type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button fullWidth type="submit" loading={creating} disabled={!form.name.trim() || !form.date}>
                <Plus size={15} />
                {creating ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
