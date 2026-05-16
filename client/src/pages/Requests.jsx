import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { incoming, outgoing, approve, reject, cancel } from '../api/requests.js';
import TrustRing from '../components/profile/TrustRing.jsx';
import Avatar from '../components/profile/Avatar.jsx';
import Button from '../components/common/Button.jsx';
import { Link } from 'react-router-dom';
import { ItemCardSkeleton } from '../components/common/Skeleton.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function Requests() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState('incoming');
  const [incomingList, setIncomingList] = useState([]);
  const [outgoingList, setOutgoingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(
    async (signal) => {
      if (!user) return;
      setLoading(true);
      try {
        const cfg = signal ? { signal } : {};
        const [inc, out] = await Promise.all([incoming(cfg), outgoing(cfg)]);
        if (signal?.aborted) return;
        setIncomingList(inc.data.data?.requests || []);
        setOutgoingList(out.data.data?.requests || []);
      } catch {
        if (signal?.aborted) return;
        toast.error('Could not load requests');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIncomingList([]);
      setOutgoingList([]);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    loadRequests(ac.signal);
    return () => ac.abort();
  }, [authLoading, user, loadRequests]);

  const list = tab === 'incoming' ? incomingList : outgoingList;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-ink">Requests</h1>
      <div className="flex gap-2 rounded-full bg-ink/5 p-1">
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
            tab === 'incoming' ? 'bg-white text-primary shadow-sm' : 'text-ink/60'
          }`}
          onClick={() => setTab('incoming')}
        >
          Incoming
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
            tab === 'outgoing' ? 'bg-white text-primary shadow-sm' : 'text-ink/60'
          }`}
          onClick={() => setTab('outgoing')}
        >
          Outgoing
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <ItemCardSkeleton />
          <ItemCardSkeleton />
        </div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white px-4 py-10 text-center text-ink/60">
          No requests here.
        </p>
      ) : (
        <div className="space-y-4">
          {list.map((r) => {
            const other = tab === 'incoming' ? r.borrower : r.owner;
            const thumb = r.item?.images?.[0];
            return (
              <div
                key={r._id}
                className="flex flex-col gap-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm md:flex-row"
              >
                <div className="h-24 w-full overflow-hidden rounded-xl bg-ink/5 md:h-24 md:w-32">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink/40">No image</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar user={other} size={40} />
                    <div>
                      <p className="font-semibold text-ink">{other?.name}</p>
                      <TrustRing score={other?.trustScore ?? 50} size={56} showLabel={false} />
                    </div>
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink/60">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink/70">{r.item?.title}</p>
                  <p className="text-xs text-ink/50">
                    {new Date(r.requestedDates?.startDate).toLocaleDateString()} →{' '}
                    {new Date(r.requestedDates?.endDate).toLocaleDateString()}
                  </p>
                  {r.message && <p className="text-sm italic text-ink/70">“{r.message}”</p>}
                  <div className="flex flex-wrap gap-2">
                    {tab === 'incoming' && r.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          onClick={async () => {
                            await approve(r._id);
                            toast.success('Approved');
                            loadRequests();
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={async () => {
                            await reject(r._id);
                            toast.success('Rejected');
                            loadRequests();
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {tab === 'outgoing' && ['pending', 'approved'].includes(r.status) && (
                      <Button
                        variant="ghost"
                        onClick={async () => {
                          await cancel(r._id);
                          toast.success('Cancelled');
                          loadRequests();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    {r.status === 'approved' && (
                      <Link
                        to={`/handoff/${r._id}`}
                        className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink"
                      >
                        Open handoff
                      </Link>
                    )}
                    {['active', 'completed'].includes(r.status) && (
                      <Link
                        to={`/handoff/${r._id}`}
                        className="text-sm font-semibold text-primary underline"
                      >
                        View handoff
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
