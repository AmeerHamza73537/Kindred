import { trustColor, trustLabelFromScore } from '../../utils/trust.js';

export default function TrustRing({ score = 50, size = 96, showLabel = true }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const offset = c * (1 - pct);
  const stroke = trustColor(score);
  const pctValue = Math.round(pct * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {size >= 64 && (
          <span
            className="absolute inset-0 flex items-center justify-center font-semibold"
            style={{ color: stroke, fontSize: size * 0.22 }}
          >
            {pctValue}%
          </span>
        )}
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Neighbor trust</p>
          <p className="font-serif text-lg text-primary">{trustLabelFromScore(score)}</p>
        </div>
      )}
    </div>
  );
}
