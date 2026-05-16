import { NavLink } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, Map, Package, User } from 'lucide-react';

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 text-[11px] font-medium ${
          isActive ? 'text-primary' : 'text-ink/50 hover:text-ink'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );
}

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-ink/10 bg-surface/95 px-1 py-2 pb-safe md:hidden">
      <NavItem to="/dashboard" icon={LayoutDashboard} label="Home" />
      <NavItem to="/explore" icon={Map} label="Explore" />
      <NavItem to="/my-items" icon={Package} label="Items" />
      <NavItem to="/requests" icon={ClipboardList} label="Requests" />
      <NavItem to="/profile/me" icon={User} label="Me" />
    </nav>
  );
}
