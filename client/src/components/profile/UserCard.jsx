import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import TrustRing from './TrustRing.jsx';
import Badge from '../common/Badge.jsx';
import { StarDisplay } from './StarRating.jsx';

export default function UserCard({ user, distanceMiles }) {
  if (!user) return null;
  return (
    <Link
      to={`/profile/${user._id}`}
      className="flex min-w-[200px] flex-col items-center gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <Avatar user={user} size={56} />
      <div className="text-center">
        <p className="font-semibold text-ink">{user.name}</p>
        {(user.ratingCount || 0) > 0 && (
          <div className="mt-1 flex items-center justify-center gap-1">
            <StarDisplay value={user.ratingAverage || 0} size={14} />
            <span className="text-xs text-ink/50">{user.ratingAverage?.toFixed(1)}</span>
          </div>
        )}
        {distanceMiles != null && (
          <p className="text-xs text-ink/50">{distanceMiles} mi away</p>
        )}
      </div>
      <TrustRing score={user.trustScore ?? 50} size={72} showLabel={false} />
      <div className="flex flex-wrap justify-center gap-1">
        <Badge tone="mint">{user.trustPills?.reliability || 'Reliability'}</Badge>
        <Badge tone="mint">{user.trustPills?.generosity || 'Generosity'}</Badge>
        <Badge tone="mint">{user.trustPills?.responsiveness || 'Responsiveness'}</Badge>
      </div>
    </Link>
  );
}
