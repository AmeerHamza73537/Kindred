import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMe, getUser } from '../api/users.js';
import { listByOwner, listMyItems } from '../api/items.js';
import { receivedGratitude } from '../api/gratitude.js';
import { receivedReviews, createReview } from '../api/reviews.js';
import { useAuth } from '../hooks/useAuth.js';
import { useGeoLocation } from '../hooks/useLocation.js';
import TrustRing from '../components/profile/TrustRing.jsx';
import Avatar from '../components/profile/Avatar.jsx';
import ItemGrid from '../components/items/ItemGrid.jsx';
import ThankYouCard from '../components/gratitude/ThankYouCard.jsx';
import ReviewCard from '../components/profile/ReviewCard.jsx';
import StarRating, { StarDisplay } from '../components/profile/StarRating.jsx';
import Modal from '../components/common/Modal.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function Profile({ self }) {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [wall, setWall] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user: viewer } = useAuth();
  const { coords, detect } = useGeoLocation();

  useEffect(() => {
    detect();
  }, [detect]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        let ures;
        if (self) {
          ures = await getMe();
          setUser(ures.data.data.user);
          const it = await listMyItems({});
          setItems(it.data.data?.items || []);
        } else {
          ures = await getUser(id);
          setUser(ures.data.data.user);
          const it = await listByOwner(id, coords ? { lat: coords.lat, lng: coords.lng, radius: 10 } : {});
          setItems(it.data.data?.items || []);
        }
        const gid = self ? ures.data.data.user._id : id;
        const [g, rev] = await Promise.all([receivedGratitude(gid), receivedReviews(gid)]);
        setWall(g.data.data?.gratitudes || []);
        setReviews(rev.data.data?.reviews || []);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, self, coords]);

  const canReview = !self && viewer && user && String(viewer._id) !== String(user._id);
  const alreadyReviewed =
    canReview && reviews.some((r) => String(r.fromUser?._id) === String(viewer._id));

  const submitReview = async () => {
    if (!rating) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      const { data } = await createReview({ toUserId: user._id, rating, comment, isPublic });
      if (data.success) {
        toast.success('Review submitted');
        setReviewOpen(false);
        setComment('');
        setRating(0);
        const rev = await receivedReviews(user._id);
        setReviews(rev.data.data?.reviews || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!user) return <p className="text-center text-ink/60">Profile not found.</p>;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-ink/5 bg-gradient-to-r from-secondary/40 to-accent/10 shadow-sm">
        <div className="h-32 bg-primary/20" />
        <div className="flex flex-col gap-4 px-6 pb-6 pt-0 md:flex-row md:items-end">
          <div className="-mt-12">
            <Avatar user={user} size={96} />
          </div>
          <div className="flex-1 pt-2 md:pt-0">
            <h1 className="font-serif text-3xl text-ink">{user.name}</h1>
            {(user.ratingCount || 0) > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink/70">
                <StarDisplay value={user.ratingAverage || 0} />
                <span>
                  {user.ratingAverage?.toFixed(1)} · {user.ratingCount} review
                  {user.ratingCount === 1 ? '' : 's'}
                </span>
              </div>
            )}
            {user.bio && <p className="mt-2 max-w-xl text-ink/70">{user.bio}</p>}
            {canReview && (
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                disabled={alreadyReviewed}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ⭐ {alreadyReviewed ? 'You reviewed this neighbor' : 'Leave a review'}
              </button>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {(user.badges || []).map((b) => (
                <span
                  key={b.name}
                  className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink shadow-sm"
                >
                  <span>{b.icon}</span>
                  {b.name}
                </span>
              ))}
            </div>
          </div>
          <TrustRing score={user.trustScore ?? 50} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-serif text-2xl">{self ? 'Your listings' : 'Their items'}</h2>
        {items.length === 0 ? (
          <p className="text-ink/60">No active listings.</p>
        ) : (
          <ItemGrid items={items} />
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">{self ? 'Reviews you’ve received' : 'Neighbor reviews'}</h2>
        {reviews.length === 0 ? (
          <p className="text-ink/60">No reviews yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">{self ? 'Thanks you’ve received' : 'Gratitude wall'}</h2>
        {wall.length === 0 ? (
          <p className="text-ink/60">No public thanks yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {wall.map((g) => (
              <ThankYouCard key={g._id} gratitude={g} />
            ))}
          </div>
        )}
      </section>

      <Modal open={reviewOpen} title={`Rate ${user.name}`} onClose={() => setReviewOpen(false)}>
        <p className="text-sm text-ink/70">How was your experience with this neighbor?</p>
        <div className="my-4">
          <StarRating value={rating} onChange={setRating} />
        </div>
        <textarea
          className="min-h-[100px] w-full rounded-2xl border border-ink/10 px-4 py-3 text-sm"
          placeholder="Share what went well (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Show on their public profile
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setReviewOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitReview} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

