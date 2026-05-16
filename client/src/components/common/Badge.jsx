export default function Badge({ children, tone = 'neutral', dot }) {
  const tones = {
    neutral: 'bg-ink/5 text-ink',
    mint: 'bg-secondary/40 text-ink',
    amber: 'bg-accent/20 text-ink',
    green: 'bg-primary/10 text-primary',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
