import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { listMyItems, getBorrowed, getGifted } from '../api/items.js';
import ItemCard from '../components/items/ItemCard.jsx';
import AvailabilityToggle from '../components/items/AvailabilityToggle.jsx';
import { ItemCardSkeleton } from '../components/common/Skeleton.jsx';

export default function MyItems() {
  const [tab, setTab] = useState('listings');
  const [owned, setOwned] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [gifted, setGifted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, b, g] = await Promise.all([listMyItems({}), getBorrowed(), getGifted()]);
      setOwned(o.data.data?.items || []);
      setBorrowed(b.data.data?.items || []);
      setGifted(g.data.data?.items || []);
    } catch {
      setOwned([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tabs = [
    { id: 'listings', label: 'My Listings' },
    { id: 'borrowed', label: 'Borrowed' },
    { id: 'gifted', label: 'Gifted' },
  ];

  const data = tab === 'listings' ? owned : tab === 'borrowed' ? borrowed : gifted;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-ink">My items</h1>
        <Link
          to="/add-item"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#245a43]"
        >
          <Plus className="h-4 w-4" />
          Add
        </Link>
      </div>

      <div className="flex gap-2 rounded-full bg-ink/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
              tab === t.id ? 'bg-white text-primary shadow-sm' : 'text-ink/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((k) => (
            <ItemCardSkeleton key={k} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white px-4 py-10 text-center text-ink/60">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((it) => (
            <div key={it._id} className="space-y-2">
              <ItemCard item={it} />
              {tab === 'listings' && (
                <AvailabilityToggle item={it} onUpdated={(updated) => setOwned((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
