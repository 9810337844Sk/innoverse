"use client";
import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function TestNotificationPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<string>("Unknown");
  const [envVars, setEnvVars] = useState({ url: "", anonKey: "" });
  
  useEffect(() => {
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    setEnvVars({ url, anonKey: anonKey ? anonKey.substring(0, 20) + "..." : "" });
    
    addLog("Test page loaded");
    addLog(`Supabase URL: ${url ? "✅ Set" : "❌ Missing"}`);
    addLog(`Anon Key: ${anonKey ? "✅ Set" : "❌ Missing"}`);
    
    // Listen for localStorage events
    const handleStorage = (e: StorageEvent) => {
      addLog(`📦 Storage event detected: key="${e.key}", value="${e.newValue?.substring(0, 30)}"`);
      if (e.key === 'new-user-registered') {
        addLog("🎉 NEW USER REGISTRATION DETECTED!");
        toast.success("User registration detected!", { duration: 5000 });
      }
      if (e.key === 'new-event-created') {
        addLog("🎉 NEW EVENT CREATION DETECTED!");
        toast.success("Event creation detected!", { duration: 5000 });
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    // Check localStorage polling (same-tab detection)
    const pollInterval = setInterval(() => {
      const userFlag = localStorage.getItem('new-user-registered');
      const eventFlag = localStorage.getItem('new-event-created');
      
      if (userFlag) {
        addLog(`🔍 Polling detected user flag: ${userFlag}`);
        localStorage.removeItem('new-user-registered');
      }
      if (eventFlag) {
        addLog(`🔍 Polling detected event flag: ${eventFlag}`);
        localStorage.removeItem('new-event-created');
      }
    }, 500);
    
    // Test Supabase Realtime connection
    if (url && anonKey) {
      import('@supabase/supabase-js').then(({ createClient }) => {
        const client = createClient(url, anonKey);
        addLog("🔴 Attempting Realtime connection...");
        
        const channel = client
          .channel('test-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
            addLog(`🔴 REALTIME EVENT: ${payload.eventType} on users table`);
            setRealtimeStatus("✅ WORKING!");
          })
          .subscribe((status) => {
            addLog(`🔴 Realtime status: ${status}`);
            setRealtimeStatus(status);
          });
        
        return () => {
          channel.unsubscribe();
        };
      });
    } else {
      setRealtimeStatus("❌ Missing env vars");
    }
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, []);
  
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${msg}`;
    console.log(logMsg);
    setLogs(prev => [logMsg, ...prev].slice(0, 50));
  };
  
  const triggerUserEvent = () => {
    localStorage.setItem('new-user-registered', Date.now().toString());
    addLog("🧪 Manually triggered 'new-user-registered' event");
    toast("Trigger sent! Check logs...", { icon: "🧪" });
  };
  
  const triggerEventEvent = () => {
    localStorage.setItem('new-event-created', Date.now().toString());
    addLog("🧪 Manually triggered 'new-event-created' event");
    toast("Trigger sent! Check logs...", { icon: "🧪" });
  };
  
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={28} className="text-indigo-600" />
            <div>
              <h1 className="font-black text-2xl text-slate-900">Notification System Test</h1>
              <p className="text-slate-500 text-sm">Debug localStorage events and Supabase Realtime</p>
            </div>
          </div>
          
          {/* Status */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Supabase URL</div>
              <div className="font-mono text-sm text-slate-700">{envVars.url || "❌ Not set"}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Anon Key</div>
              <div className="font-mono text-sm text-slate-700">{envVars.anonKey || "❌ Not set"}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Realtime Status</div>
              <div className="font-semibold text-sm text-slate-900">{realtimeStatus}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Log Count</div>
              <div className="font-semibold text-sm text-slate-900">{logs.length} entries</div>
            </div>
          </div>
        </div>
        
        {/* Manual Triggers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg text-slate-900 mb-4">Manual Event Triggers</h2>
          <p className="text-sm text-slate-500 mb-4">
            Test the notification system by manually triggering localStorage events
          </p>
          <div className="flex gap-3">
            <button
              onClick={triggerUserEvent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              <CheckCircle size={16} /> Trigger User Registration
            </button>
            <button
              onClick={triggerEventEvent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
            >
              <CheckCircle size={16} /> Trigger Event Creation
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">How to Test</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>1. Open this page in one tab</li>
                <li>2. Open admin panel (/admin/users) in another tab</li>
                <li>3. Click "Trigger User Registration" above</li>
                <li>4. Check if admin panel updates automatically</li>
                <li>5. Watch the logs below for event detection</li>
              </ul>
              <p className="text-xs text-amber-700 mt-3">
                <strong>Note:</strong> storage events only fire in OTHER tabs. Same-tab updates rely on 500ms polling.
              </p>
            </div>
          </div>
        </div>
        
        {/* Logs */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Console Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic">No logs yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-slate-300">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Real-time Test Instructions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg text-slate-900 mb-3">Realtime Connection Test</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p><strong>Expected if Realtime is ENABLED:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-slate-500">
              <li>Status shows "SUBSCRIBED" above</li>
              <li>When you register a user, logs show "REALTIME EVENT: INSERT"</li>
              <li>Updates appear in &lt;100ms</li>
            </ul>
            
            <p className="pt-3"><strong>If Realtime is NOT ENABLED:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-slate-500">
              <li>Status shows "CLOSED" or "CHANNEL_ERROR"</li>
              <li>No realtime events in logs</li>
              <li>Need to run SQL: <code className="bg-slate-100 px-1 rounded">ALTER PUBLICATION supabase_realtime ADD TABLE users;</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
