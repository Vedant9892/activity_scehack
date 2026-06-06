import { useState } from "react";

export default function NotificationPanel({ notifications, onSnooze, snoozingId }) {
  const delayed = notifications.delayed || [];
  const delivered = notifications.delivered || [];
  const [snoozeMinutes, setSnoozeMinutes] = useState(10);

  // Redis uses LPUSH, so index 0 is newest. Keep newest items first for UI clarity.
  const latestDelayed = delayed.slice(0, 5);
  const latestDelivered = delivered.slice(0, 5);

  const recentItems = [...latestDelivered, ...latestDelayed]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 8);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Notification Queue</h3>
      <p className="mt-1 text-sm text-slate-500">Pending: {notifications.pending_count}</p>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-semibold text-slate-800">Recent Notifications</h4>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="snooze-minutes" className="text-slate-500">
              Snooze
            </label>
            <select
              id="snooze-minutes"
              value={snoozeMinutes}
              onChange={(event) => setSnoozeMinutes(Number(event.target.value))}
              className="rounded-md border border-slate-300 px-2 py-1"
            >
              <option value={5}>5 min</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
            </select>
          </div>
        </div>
        {recentItems.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No recent notifications yet</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {recentItems.map((item) => (
              <li key={`recent-${item.id}-${item.created_at}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{item.title}</p>
                  <span className="text-xs text-slate-500">{item.importance || "medium"}</span>
                </div>
                <p className="text-xs text-slate-600">{item.action || "delay"}</p>
                <p className="text-xs text-slate-500">
                  {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "No timestamp"}
                </p>
                <button
                  type="button"
                  onClick={() => onSnooze?.(item.id, snoozeMinutes)}
                  disabled={snoozingId === item.id}
                  className="mt-2 rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
                >
                  {snoozingId === item.id ? "Snoozing..." : `Snooze ${snoozeMinutes}m`}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h4 className="font-semibold text-amber-700">Delayed / Batched</h4>
          {delayed.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No delayed notifications</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {latestDelayed.map((item) => (
                <li key={`delayed-${item.id}`} className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-slate-600">{item.action || "delay"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-emerald-700">Delivered</h4>
          {delivered.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No delivered notifications</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {latestDelivered.map((item) => (
                <li key={`delivered-${item.id}`} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-slate-600">{item.action || "deliver"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
