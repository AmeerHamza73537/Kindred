import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import { ItemCardSkeleton } from '../components/common/Skeleton.jsx';
import ItemGrid from '../components/items/ItemGrid.jsx';
import UserCard from '../components/profile/UserCard.jsx';
import { useGeoLocation } from '../hooks/useLocation.js';
import { listItems } from '../api/items.js';
import { getNearby } from '../api/users.js';
import { useAuth } from '../hooks/useAuth.js';

const categories = ['Tools', 'Kitchen', 'Skills', 'Garden', 'Electronics', 'Sports', 'Other'];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { coords, detect } = useGeoLocation();
  const [items, setItems] = useState([]);
  const [neighbors, setNeighbors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detect();
  }, [detect]);

  useEffect(() => {
    if (!coords) return;
    const run = async () => {
      setLoading(true);
      try {
        const [it, nb] = await Promise.all([
          listItems({ lat: coords.lat, lng: coords.lng, radius: 5 }),
          getNearby({ lat: coords.lat, lng: coords.lng, radius: 5 }),
        ]);
        setItems(it.data.data?.items || []);
        setNeighbors(nb.data.data?.users || []);
      } catch {
        setItems([]);
        setNeighbors([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [coords]);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-secondary/40 via-surface to-accent/10 px-6 py-10 shadow-sm md:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Neighborhood sharing</p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl text-ink md:text-5xl">
          Share More. Waste Less. Know Your Neighbors.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          Borrow tools, gift what you no longer need, trade skills — all within five miles of home.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-inner ring-1 ring-ink/10">
            <Search className="h-5 w-5 text-ink/40" />
            <input
              readOnly
              onClick={() => navigate('/explore')}
              placeholder="Search listings near you…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Button variant="primary" onClick={() => navigate('/explore')}>
            Open explore
          </Button>
          <Button variant="ghost" onClick={detect}>
            Refresh location
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink">Browse by category</h2>
          <Link to="/explore" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => navigate(`/explore?category=${encodeURIComponent(c)}`)}
              className="rounded-2xl border border-ink/5 bg-white px-4 py-4 text-left text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink">Items near you</h2>
        </div>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3].map((k) => (
              <ItemCardSkeleton key={k} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white px-4 py-8 text-center text-ink/60">
            No listings yet nearby. Be the first to share something on{' '}
            <Link className="font-semibold text-primary" to="/add-item">
              Add Item
            </Link>
            .
          </p>
        ) : (
          <ItemGrid items={items} />
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink">Your neighbors</h2>
        </div>
        {!user ? (
          <p className="text-sm text-ink/60">
            <Link className="font-semibold text-primary" to="/login">
              Log in
            </Link>{' '}
            to see richer neighbor profiles.
          </p>
        ) : loading ? (
          <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3].map((k) => (
              <div key={k} className="h-40 min-w-[200px] animate-pulse rounded-2xl bg-ink/10" />
            ))}
          </div>
        ) : neighbors.length === 0 ? (
          <p className="text-ink/60">No neighbors found in this radius yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {neighbors.map((u) => (
              <UserCard key={u._id} user={u} distanceMiles={u.distanceMiles} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
