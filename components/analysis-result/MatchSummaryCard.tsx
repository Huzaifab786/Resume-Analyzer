type MatchSummaryCardProps = {
  summary: string;
};

export function MatchSummaryCard({ summary }: MatchSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-primary">Match Summary</h2>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{summary}</p>
    </section>
  );
}
