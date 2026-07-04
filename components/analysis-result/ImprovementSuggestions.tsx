type ImprovementSuggestionsProps = {
  suggestions: string[];
};

export function ImprovementSuggestions({
  suggestions,
}: ImprovementSuggestionsProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-primary">
        Improvement Suggestions
      </h2>

      {suggestions.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion} className="flex gap-3 text-sm text-text-secondary">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-semibold text-accent-dark">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{suggestion}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-text-muted">No suggestions available.</p>
      )}
    </section>
  );
}
