import { useMemo, useState } from 'react';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** Monday-first labels; use stable ids (not `key` / not duplicate letters) for React reconciliation. */
const WEEKDAY_HEADINGS = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' },
];

export default function AvailabilityCalendar({
  availability = [],
  selectedStart,
  selectedEnd,
  onSelectDay,
  readOnly,
}) {
  const [cursor, setCursor] = useState(() => new Date());

  const { year, month, daysInMonth, leadingBlanks } = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const blanks = (first.getDay() + 6) % 7;
    return { year: y, month: m, daysInMonth: last.getDate(), leadingBlanks: blanks };
  }, [cursor]);

  const bookedSet = useMemo(() => {
    const s = new Set();
    availability.forEach((a) => {
      if (a.isBooked) s.add(startOfDay(new Date(a.date)).getTime());
    });
    return s;
  }, [availability]);

  const today = startOfDay(new Date()).getTime();

  const inRange = (d) => {
    if (!selectedStart || !selectedEnd) return false;
    const t = startOfDay(d).getTime();
    return t >= startOfDay(selectedStart).getTime() && t <= startOfDay(selectedEnd).getTime();
  };

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="rounded-full px-2 py-1 text-sm text-ink/60 hover:bg-ink/5"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ‹
        </button>
        <p className="font-serif text-lg">
          {new Date(year, month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </p>
        <button
          type="button"
          className="rounded-full px-2 py-1 text-sm text-ink/60 hover:bg-ink/5"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink/50">
        {WEEKDAY_HEADINGS.map(({ id, label }) => (
          <span key={id}>{label}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} />;
          const t = startOfDay(date).getTime();
          const past = t < today;
          const booked = bookedSet.has(t);
          const selected = inRange(date);
          let bg = 'bg-emerald-50 text-emerald-900';
          if (past) bg = 'bg-slate-100 text-slate-400';
          else if (booked) bg = 'bg-amber-50 text-amber-900';
          if (selected) bg = 'bg-primary/15 text-primary ring-1 ring-primary/40';

          return (
            <button
              key={t}
              type="button"
              disabled={readOnly || past}
              onClick={() => !readOnly && !past && onSelectDay?.(date)}
              className={`aspect-square rounded-lg text-sm font-medium transition ${bg}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/60">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Available
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Booked / blocked
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300" /> Past
        </span>
      </div>
    </div>
  );
}

export { sameDay, startOfDay };
