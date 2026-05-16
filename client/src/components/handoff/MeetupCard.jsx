import { MapPin } from 'lucide-react';

export default function MeetupCard({ handoff }) {
  const p = handoff?.pickupDetails;
  if (!p?.location && !p?.scheduledTime) return null;
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-secondary/40 p-2 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Meetup</p>
          <p className="font-medium text-ink">{p.method?.replace('_', ' ')}</p>
          {p.location && <p className="text-sm text-ink/70">{p.location}</p>}
          {p.scheduledTime && (
            <p className="text-sm text-ink/70">{new Date(p.scheduledTime).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
