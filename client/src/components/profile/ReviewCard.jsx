import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { StarDisplay } from './StarRating.jsx';

export default function ReviewCard({ review }) {
  const from = review.fromUser;
  return (
    <article className="rounded-2xl border border-ink/5 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar user={from} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link to={`/profile/${from?._id}`} className="font-semibold text-primary hover:underline">
              {from?.name || 'Neighbor'}
            </Link>
            <StarDisplay value={review.rating} />
          </div>
          {review.item?.title && (
            <p className="mt-1 text-xs text-ink/50">Exchange: {review.item.title}</p>
          )}
          {review.comment && <p className="mt-2 text-sm text-ink/80">{review.comment}</p>}
          <p className="mt-2 text-xs text-ink/40">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </article>
  );
}
