export default function SummaryCard({ summary }) {
  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">AI Summary</p>
      <p className="mt-2 text-sm text-indigo-900">{summary || "Waiting for summary updates..."}</p>
    </section>
  );
}
