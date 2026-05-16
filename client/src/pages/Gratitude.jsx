import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRequest } from '../api/requests.js';
import { sendGratitude } from '../api/gratitude.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import { TokenBadge } from '../components/gratitude/GratitudeCard.jsx';

const tokens = [
  { id: 'seedling', emoji: '🌱', label: 'Seedling' },
  { id: 'hammer', emoji: '🔨', label: 'Reliable' },
  { id: 'sparkle', emoji: '✨', label: 'Sparkle' },
  { id: 'heart', emoji: '❤️', label: 'Warm heart' },
  { id: 'star', emoji: '⭐', label: 'Star' },
];

export default function Gratitude() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [message, setMessage] = useState('');
  const [tokenType, setTokenType] = useState('sparkle');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    getRequest(requestId)
      .then(({ data }) => {
        if (data.success) setRequest(data.data.request);
      })
      .catch(() => setRequest(null));
  }, [requestId]);

  const toUserId =
    request &&
    (String(request.borrower?._id || request.borrower) === String(user?._id)
      ? String(request.owner?._id || request.owner)
      : String(request.borrower?._id || request.borrower));

  const send = async () => {
    try {
      const { data } = await sendGratitude({
        requestId,
        toUserId,
        message,
        tokenType,
        isPublic,
      });
      if (data.success) {
        toast.success('Thanks sent');
        navigate(`/profile/${toUserId}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not send');
    }
  };

  if (!request) {
    return <div className="flex min-h-[50vh] items-center justify-center text-ink/60">Loading…</div>;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center space-y-6 rounded-3xl bg-gradient-to-b from-secondary/30 to-surface px-6 py-10 shadow-inner">
      <h1 className="text-center font-serif text-3xl text-ink">Send a little thanks</h1>
      <p className="text-center text-sm text-ink/70">
        No stars — just a warm note and a token that celebrates how this exchange felt.
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {tokens.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTokenType(t.id)}
            className={`rounded-2xl border px-2 py-3 text-center text-2xl ${
              tokenType === t.id ? 'border-primary bg-white shadow-md' : 'border-transparent bg-white/60'
            }`}
          >
            <div>{t.emoji}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink/60">{t.label}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <TokenBadge type={tokenType} />
      </div>
      <textarea
        className="min-h-[120px] w-full rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm shadow-inner"
        placeholder="Optional personal message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-ink/80">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Share publicly on their profile
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="primary" className="sm:min-w-[160px]" onClick={send}>
          Send thanks
        </Button>
        <Button variant="ghost" className="sm:min-w-[120px]" onClick={() => navigate('/')}>
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
