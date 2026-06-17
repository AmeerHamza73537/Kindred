import { Link } from 'react-router-dom';
import Badge from '../common/Badge.jsx';
import Avatar from '../profile/Avatar.jsx';

const statusTone = {
  available: 'green',
  in_use: 'amber',
  lent_out: 'amber',
};

const statusLabel = {
  available: 'Available',
  in_use: 'In Use',
  lent_out: 'Lent Out',
};

export default function ItemCard({ item }) {
  if (!item) return null;
  const img = item.images?.[0];
  const owner = item.owner;
  const tone = statusTone[item.status] || 'neutral';
  return (
    <Link
      to={`/items/${item._id}`}
      className="group flex min-w-[260px] max-w-xs flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-ink/5">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/30">No photo</div>
        )}
        <div className="absolute left-3 top-3">
          <Badge tone={tone} dot>
            {statusLabel[item.status] || item.status}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg text-ink group-hover:text-primary">{item.title}</h3>
            <p className="text-xs uppercase tracking-wide text-ink/50">
              {item.category} · {item.type}
            </p>
          </div>
          {owner && <Avatar user={owner} size={36} />}
        </div>
        {item.address && (
          <p className="flex items-start gap-1 text-sm text-ink/60">
            <svg className="mt-0.5 h-3.5 w-3.5 flex-none text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="line-clamp-1">{item.address}</span>
          </p>
        )}
        {item.distanceMiles != null && (
          <p className="text-sm text-ink/60">{item.distanceMiles} mi away</p>
        )}
      </div>
    </Link>
  );
}
