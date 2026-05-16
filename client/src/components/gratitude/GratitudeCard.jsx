const map = {
  star: '⭐',
  heart: '❤️',
  seedling: '🌱',
  hammer: '🔨',
  sparkle: '✨',
};

export function TokenBadge({ type }) {
  return <span className="text-2xl">{map[type] || '✨'}</span>;
}

export default function GratitudeCard({ g }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <TokenBadge type={g.tokenType} />
        <div>
          <p className="text-sm font-semibold text-ink">{g.fromUser?.name || 'Neighbor'}</p>
          {g.message && <p className="mt-1 text-sm text-ink/70">{g.message}</p>}
          <p className="mt-2 text-xs text-ink/40">{new Date(g.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
