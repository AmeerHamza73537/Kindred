import { useState } from 'react';
import { patchItemStatus } from '../../api/items.js';
import toast from 'react-hot-toast';

const order = ['available', 'in_use', 'lent_out'];

export default function AvailabilityToggle({ item, onUpdated }) {
  const [status, setStatus] = useState(item.status);
  const [busy, setBusy] = useState(false);

  const cycle = async () => {
    const idx = order.indexOf(status);
    const next = order[(idx + 1) % order.length];
    setBusy(true);
    try {
      const { data } = await patchItemStatus(item._id, next);
      if (data.success) {
        setStatus(next);
        onUpdated?.(data.data.item);
        toast.success('Listing status updated');
      }
    } catch {
      toast.error('Could not update status');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={cycle}
      disabled={busy}
      className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink hover:bg-ink/10"
    >
      {busy ? 'Saving…' : `Status: ${status.replace('_', ' ')}`}
    </button>
  );
}
