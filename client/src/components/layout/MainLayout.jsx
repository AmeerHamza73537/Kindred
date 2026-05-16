import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import MobileNav from './MobileNav.jsx';

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>
      <Footer />
      {user && <MobileNav />}
    </div>
  );
}
