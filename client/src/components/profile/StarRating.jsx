import { Star } from 'lucide-react';

export function StarDisplay({ value = 0, size = 18, className = '' }) {
  const rounded = Math.round(value * 2) / 2;
  const dim = size === 18 ? 'h-[18px] w-[18px]' : 'h-4 w-4';
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${dim} ${n <= rounded ? 'fill-amber-400 text-amber-400' : 'text-ink/20'}`}
        />
      ))}
    </span>
  );
}

export default function StarRating({ value, onChange, size = 32 }) {
  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Rate 1 to 5 stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded-full p-1 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-ink/25'}
          />
        </button>
      ))}
    </div>
  );
}
