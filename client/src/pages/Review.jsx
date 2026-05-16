import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRequest } from '../api/requests.js';
import { createReview, getReviewForRequest } from '../api/reviews.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import StarRating from '../components/profile/StarRating.jsx';

export default function Review() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const [{ data: reqData }, { data: revData }] = await Promise.all([
          getRequest(requestId),
          getReviewForRequest(requestId),
        ]);
        if (reqData.success) setRequest(reqData.data.request);
        if (revData.success && revData.data.review) {
          setAlreadySubmitted(true);
          setRating(revData.data.review.rating);
          setComment(revData.data.review.comment || '');
        }
      } catch {
        setRequest(null);
      }
    };
    run();
  }, [requestId]);

  const toUserId =
    request &&
    (String(request.borrower?._id || request.borrower) === String(user?._id)
      ? String(request.owner?._id || request.owner)
      : String(request.borrower?._id || request.borrower));

  const otherName =
    request &&
    (String(request.borrower?._id || request.borrower) === String(user?._id)
      ? request.owner?.name
      : request.borrower?.name);

  const submit = async () => {
    if (!rating) return toast.error('Please select a star rating');
    try {
      const { data } = await createReview({
        requestId,
        toUserId,
        rating,
        comment,
        isPublic,
      });
      if (data.success) {
        toast.success('Review submitted');
        navigate(`/profile/${toUserId}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not submit review');
    }
  };

  if (!request) {
    return <div className="flex min-h-[50vh] items-center justify-center text-ink/60">Loading…</div>;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center space-y-6 rounded-3xl bg-gradient-to-b from-secondary/30 to-surface px-6 py-10 shadow-inner">
      <h1 className="text-center font-serif text-3xl text-ink">Rate your neighbor</h1>
      <p className="text-center text-sm text-ink/70">
        How was your exchange with <span className="font-semibold">{otherName}</span>?
      </p>
      {alreadySubmitted ? (
        <p className="text-center text-sm text-primary">You already left a review for this exchange.</p>
      ) : (
        <StarRating value={rating} onChange={setRating} />
      )}
      <textarea
        className="min-h-[120px] w-full rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm shadow-inner disabled:opacity-60"
        placeholder="Share what went well (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={alreadySubmitted}
      />
      {!alreadySubmitted && (
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Show on their public profile
        </label>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {!alreadySubmitted && (
          <Button variant="primary" className="sm:min-w-[160px]" onClick={submit}>
            Submit review
          </Button>
        )}
        <Button
          variant="ghost"
          className="sm:min-w-[120px]"
          onClick={() => navigate(alreadySubmitted ? `/profile/${toUserId}` : `/gratitude/${requestId}`)}
        >
          {alreadySubmitted ? 'View profile' : 'Send thanks instead'}
        </Button>
        <Button variant="ghost" className="sm:min-w-[100px]" onClick={() => navigate('/')}>
          Skip
        </Button>
      </div>
      <p className="text-center text-xs text-ink/50">
        <Link to={`/handoff/${requestId}`} className="text-primary">
          Back to handoff
        </Link>
      </p>
    </div>
  );
}


