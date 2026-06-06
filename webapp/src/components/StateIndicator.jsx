export default function StateIndicator({ state }) {
  const stateText = state?.focus_state || "focused";

  const colorMap = {
    focused: "bg-emerald-100 text-emerald-700 border-emerald-300",
    distracted: "bg-amber-100 text-amber-700 border-amber-300",
    idle: "bg-sky-100 text-sky-700 border-sky-300",
  };

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${colorMap[stateText] || colorMap.focused}`}>
      <p className="text-sm font-medium uppercase tracking-wide">Current State</p>
      <h2 className="mt-2 text-4xl font-extrabold capitalize">{stateText}</h2>
      <p className="mt-2 text-sm opacity-80">Last updated: {state?.updated_at ? new Date(state.updated_at).toLocaleTimeString() : "N/A"}</p>
    </section>
  );
}
