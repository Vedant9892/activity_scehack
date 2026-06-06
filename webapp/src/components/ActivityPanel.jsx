export default function ActivityPanel({ state }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Activity Metrics</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Active URL</p>
          <p className="mt-1 break-all text-sm font-medium text-slate-900">{state.active_url || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Tab Switches (Total)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.tab_switch_count}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Tab Switches (Last 5s)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.tab_switches_last_5s}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Idle Time</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.idle_seconds}s</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Activity Frequency</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.activity_frequency ?? 0}</p>
        </div>
      </div>
    </section>
  );
}
