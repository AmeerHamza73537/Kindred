import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getItem, getAvailability, postAvailability } from '../api/items.js';
import { createRequest } from '../api/requests.js';
import { useAuth } from '../hooks/useAuth.js';
import Avatar from '../components/profile/Avatar.jsx';
import TrustRing from '../components/profile/TrustRing.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import AvailabilityCalendar, { startOfDay } from '../components/items/AvailabilityCalendar.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [range, setRange] = useState({ start: null, end: null });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [{ data }, av] = await Promise.all([getItem(id), getAvailability(id)]);
        setItem(data.data.item);
        setAvailability(av.data.data?.availability || []);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const owner = item?.owner;
  const isOwner = user && owner && String(owner._id || owner) === String(user._id);

  const onSelectDay = (d) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: d, end: null });
      return;
    }
    if (d < range.start) setRange({ start: d, end: range.start });
    else setRange({ start: range.start, end: d });
  };

  const blockDates = async () => {
    if (!range.start) return toast.error('Pick at least one day');
    const dates = [];
    const cur = new Date(startOfDay(range.start));
    const last = range.end ? new Date(startOfDay(range.end)) : cur;
    while (cur <= last) {
      dates.push(cur.toISOString());
      cur.setDate(cur.getDate() + 1);
    }
    try {
      const { data } = await postAvailability(id, dates);
      if (data.success) {
        toast.success('Dates blocked');
        setAvailability(data.data.availability);
      }
    } catch {
      toast.error('Could not block dates');
    }
  };

  const submitRequest = async () => {
    if (!user) return navigate('/login');
    if (!range.start || !range.end) return toast.error('Choose a date range');
    try {
      const { data } = await createRequest({
        itemId: id,
        startDate: range.start,
        endDate: range.end,
        message,
      });
      if (data.success) {
        toast.success('Request sent');
        setOpen(false);
        navigate('/requests');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Request failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!item) {
    return <p className="text-center text-ink/60">Item not found.</p>;
  }

  const imgs = item.images?.length ? item.images : [];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-sm">
          <div className="relative aspect-[16/10] bg-ink/5">
            {imgs.length ? (
              <img src={imgs[slide]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/40">No photos yet</div>
            )}
            {imgs.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`h-2 w-2 rounded-full ${i === slide ? 'bg-white' : 'bg-white/40'}`}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl text-ink">{item.title}</h1>
            <Badge tone="mint" dot>
              {item.status?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="mt-2 text-sm uppercase tracking-wide text-ink/50">
            {item.category} · {item.type}
          </p>
          <p className="mt-4 text-ink/80">{item.description}</p>
        </div>

        <AvailabilityCalendar
          availability={availability}
          selectedStart={range.start}
          selectedEnd={range.end}
          onSelectDay={onSelectDay}
          readOnly={!user}
        />
        <p className="text-sm text-ink/60">
          {!user && 'Log in to choose dates and send a borrow request.'}
          {user &&
            isOwner &&
            'Tap the first and last day to block (or a single day), then tap Block selected range.'}
          {user &&
            !isOwner &&
            'Tap once for pickup day, again for return day — the range highlights. Then tap Request to borrow.'}
        </p>
        {isOwner && (
          <Button variant="ghost" onClick={blockDates}>
            Block selected range
          </Button>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Listed by</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar user={owner} size={48} />
            <div>
              <Link className="font-semibold text-primary" to={`/profile/${owner?._id}`}>
                {owner?.name}
              </Link>
              <p className="text-xs text-ink/50">Neighbor on Kindred</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <TrustRing score={owner?.trustScore ?? 50} />
          </div>
        </div>
        {!isOwner && (
          <Button variant="accent" className="w-full" onClick={() => setOpen(true)}>
            Request to borrow
          </Button>
        )}
      </aside>

      <Modal open={open} title="Request this listing" onClose={() => setOpen(false)}>
        <p className="text-sm text-ink/70">Pick your dates on the calendar, add an optional note, then send.</p>
        <textarea
          className="mt-3 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          rows={3}
          placeholder="Optional message to the owner"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitRequest}>
            Send request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
