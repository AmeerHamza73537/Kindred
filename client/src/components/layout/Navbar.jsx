import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg text-white">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div>
            <p className="font-serif text-xl leading-none text-primary">Kindred</p>
            <p className="text-[11px] text-ink/50">Neighbors sharing kind</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link className="text-sm font-medium text-ink/70 hover:text-primary" to="/explore">
            Explore
          </Link>
          {user && (
            <>
              <Link className="text-sm font-medium text-ink/70 hover:text-primary" to="/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm font-medium text-ink/70 hover:text-primary" to="/my-items">
                My Items
              </Link>
              <Link className="text-sm font-medium text-ink/70 hover:text-primary" to="/requests">
                Requests
              </Link>
              <Link className="text-sm font-medium text-ink/70 hover:text-primary" to="/profile/me">
                Profile
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" className="!px-3 !py-2 text-sm" onClick={() => navigate('/add-item')}>
                List something
              </Button>
              <Button variant="primary" className="!px-3 !py-2 text-sm" onClick={() => logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="!px-3 !py-2 text-sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button variant="accent" className="!px-3 !py-2 text-sm" onClick={() => navigate('/register')}>
                Join
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
