import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dashboard</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Hi, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-2 text-ink/70">Your home base for nearby sharing.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/my-items"
          className="rounded-2xl border border-ink/5 bg-white p-4 shadow-sm hover:border-primary/30"
        >
          <p className="text-sm text-ink/50">Listings</p>
          <p className="font-serif text-2xl text-primary">Manage items</p>
        </Link>
        <Link
          to="/requests"
          className="rounded-2xl border border-ink/5 bg-white p-4 shadow-sm hover:border-primary/30"
        >
          <p className="text-sm text-ink/50">Borrow & lend</p>
          <p className="font-serif text-2xl text-primary">Requests</p>
        </Link>
        <Link
          to="/profile/me"
          className="rounded-2xl border border-ink/5 bg-white p-4 shadow-sm hover:border-primary/30"
        >
          <p className="text-sm text-ink/50">Your reputation</p>
          <p className="font-serif text-2xl text-primary">Profile</p>
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/explore"
          className="inline-flex rounded-full border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          Explore nearby
        </Link>
        <Link
          to="/add-item"
          className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-[#e8924f]"
        >
          List a new item
        </Link>
      </div>
    </div>
  );
}
