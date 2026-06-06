export default function Navbar({ isConnected }) {
  return (
    <header className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Context-Aware Notification Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time user context, queue decisions, and AI summaries</p>
      </div>
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          isConnected
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isConnected ? "WebSocket Live" : "Reconnecting..."}
      </span>
    </header>
  );
}
