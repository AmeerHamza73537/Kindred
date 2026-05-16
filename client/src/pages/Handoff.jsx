import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRequest } from '../api/requests.js';
import {
  getHandoffByRequest,
  initiateHandoff,
  setPickupDetails,
  confirmPickup,
  verifyCode,
  confirmReturn,
} from '../api/handoff.js';
import { useAuth } from '../hooks/useAuth.js';
import HandoffFlow from '../components/handoff/HandoffFlow.jsx';
import HandoffCodeBox from '../components/handoff/HandoffCodeBox.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function Handoff() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [handoff, setHandoff] = useState(null);
  const [showCodeToOwner, setShowCodeToOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('doorstep');
  const [locationText, setLocationText] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const loadHandoff = useCallback(async () => {
    try {
      const { data } = await getHandoffByRequest(requestId);
      if (data.success) {
        setHandoff(data.data.handoff ?? null);
        setShowCodeToOwner(!!data.data.showCodeToOwner);
        return !!data.data.handoff;
      }
    } catch {
      setHandoff(null);
    }
    return false;
  }, [requestId]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await getRequest(requestId);
        if (data.success) setRequest(data.data.request);
        await loadHandoff();
      } catch {
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [requestId, loadHandoff]);

  const isOwner = request && String(request.owner?._id || request.owner) === String(user?._id);
  const isBorrower = request && String(request.borrower?._id || request.borrower) === String(user?._id);
  const itemType = handoff?.item?.type || request?.item?.type || 'lend';

  const startHandoff = async () => {
    try {
      await initiateHandoff(requestId);
      toast.success('Handoff started');
      await loadHandoff();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not start');
    }
  };

  const savePickup = async () => {
    try {
      const { data } = await setPickupDetails(handoff._id, {
        method,
        location: locationText,
        scheduledTime: scheduledTime || undefined,
      });
      if (data.success) {
        toast.success('Pickup details saved');
        setHandoff(data.data.handoff);
      }
    } catch {
      toast.error('Save failed');
    }
  };

  const doConfirmPickup = async () => {
    try {
      const { data } = await confirmPickup(handoff._id);
      if (data.success) {
        toast.success('Pickup time confirmed on your side');
        setHandoff(data.data.handoff);
      }
    } catch {
      toast.error('Could not confirm');
    }
  };

  const onCodeComplete = async (code) => {
    try {
      const { data } = await verifyCode(handoff._id, code);
      if (data.success) {
        toast.success('Verified');
        setHandoff(data.data.handoff);
        if (data.data.handoff.stage === 'completed') {
          window.location.href = `/review/${requestId}`;
        }
      }
    } catch {
      toast.error('Invalid code');
    }
  };

  const doReturn = async (step) => {
    try {
      const { data } = await confirmReturn(handoff._id, step);
      if (data.success) {
        setHandoff(data.data.handoff);
        if (data.data.handoff.stage === 'completed') {
          toast.success('Handoff complete');
          window.location.href = `/review/${requestId}`;
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not update return');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!request) {
    return <p className="text-center text-ink/60">Request not found.</p>;
  }

  if (!handoff) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-ink/5 bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-2xl text-ink">Handoff not started</h1>
        <p className="text-sm text-ink/60">Once a request is approved, the owner starts the pickup plan.</p>
        {isOwner && request.status === 'approved' ? (
          <Button variant="primary" onClick={startHandoff}>
            Start handoff
          </Button>
        ) : (
          <p className="text-sm text-ink/60">You’ll see pickup details here when the owner begins.</p>
        )}
        <div>
          <Link className="text-sm font-semibold text-primary" to="/requests">
            Back to requests
          </Link>
        </div>
      </div>
    );
  }

  const codeReady = !!(handoff.pickupDetails?.confirmedByOwner && handoff.pickupDetails?.confirmedByBorrower);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <HandoffFlow handoff={handoff} itemType={itemType} />

      {isOwner && handoff.stage === 'pickup_pending' && (
        <div className="space-y-3 rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl">Set pickup</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { id: 'doorstep', label: '🚪 My Doorstep' },
              { id: 'public_spot', label: '📍 Public Spot' },
              { id: 'custom', label: '✏️ Custom' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${
                  method === m.id ? 'border-primary bg-primary/5 text-primary' : 'border-ink/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <textarea
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            placeholder="Address or meetup instructions"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
          <Button variant="primary" onClick={savePickup}>
            Save pickup details
          </Button>
        </div>
      )}

      {handoff.stage === 'pickup_pending' && (
        <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
          <p className="text-sm text-ink/70">
            Both neighbors confirm the pickup window. Then a four-digit code is generated for the day-of handoff.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={doConfirmPickup}>
              I confirm this pickup plan
            </Button>
          </div>
        </div>
      )}

      {codeReady && handoff.stage === 'pickup_pending' && showCodeToOwner && (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
          <p className="text-sm font-semibold text-primary">Show this code to your neighbor</p>
          <p className="mt-4 font-mono text-5xl font-bold tracking-[0.3em] text-ink">{handoff.handoffCode}</p>
        </div>
      )}

      {codeReady && isBorrower && handoff.stage === 'pickup_pending' && (
        <div className="space-y-3 rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
          <p className="text-sm text-ink/70">Enter the code the owner shows you.</p>
          <HandoffCodeBox key={`${handoff._id}-${handoff.handoffCode || 'x'}`} onComplete={onCodeComplete} />
        </div>
      )}

      {handoff.stage === 'item_with_borrower' && itemType !== 'gift' && isBorrower && (
        <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
          <h3 className="font-serif text-lg">Return</h3>
          <p className="mt-1 text-sm text-ink/60">When you’re ready to give the item back, tap below.</p>
          <Button className="mt-3" variant="accent" onClick={() => doReturn('borrower_returning')}>
            I’m returning the item
          </Button>
        </div>
      )}

      {handoff.stage === 'return_pending' && isOwner && itemType !== 'gift' && (
        <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
          <h3 className="font-serif text-lg">Confirm return</h3>
          <p className="mt-1 text-sm text-ink/60">Your neighbor is returning the item. Confirm when you have it back.</p>
          <Button className="mt-3" variant="primary" onClick={() => doReturn('owner_received')}>
            I received the item back
          </Button>
        </div>
      )}

      {handoff.stage === 'completed' && (
        <div className="rounded-2xl border border-ink/5 bg-white p-6 text-center shadow-sm">
          <p className="font-serif text-xl text-primary">All set!</p>
          <Link className="mt-3 inline-block text-sm font-semibold text-primary" to={`/review/${requestId}`}>
            Leave a review →
          </Link>
        </div>
      )}
    </div>
  );
}
