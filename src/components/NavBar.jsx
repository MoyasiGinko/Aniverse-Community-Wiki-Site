"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { BsList, BsX } from 'react-icons/bs';
import logoImage from '../assets/av.png';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleOverlay = () => {
    setOverlayOpen(!isOverlayOpen);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setAccountOpen(false);
  };

  const onLogout = async () => {
    try {
      await logout();
      closeOverlay();
      router.push('/auth');
      router.refresh();
    } catch {
      closeOverlay();
    }
  };

  const navClassName = (path) => (`nav-link ${pathname === path ? 'active' : ''}`);

  return (
    <header className="site-header">
      <div className="header-shell">
        <Link href="/" className="brand-mark" aria-label="Aniverse Home">
          <Image src={logoImage} alt="Aniverse logo" className="logo-v" width={44} height={44} priority />
          <div>
            <strong>Aniverse</strong>
            <span>Anime Discovery + Community</span>
          </div>
        </Link>

        <nav className={`navBar ${isOverlayOpen ? 'open' : ''}`}>
          <Link href="/" className={navClassName('/')} onClick={closeOverlay}>Home</Link>
          <Link href="/anime" className={navClassName('/anime')} onClick={closeOverlay}>Anime</Link>
          <Link href="/genres" className={navClassName('/genres')} onClick={closeOverlay}>Genres</Link>
          <Link href="/search" className={navClassName('/search')} onClick={closeOverlay}>Search</Link>
          <Link href="/wiki" className={navClassName('/wiki')} onClick={closeOverlay}>Wiki</Link>
          <Link href="/community" className={navClassName('/community')} onClick={closeOverlay}>Community</Link>
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="account-menu">
              <button
                type="button"
                className="account-trigger"
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
              >
                @{user?.username}
              </button>
              <div className={`account-dropdown ${isAccountOpen ? 'open' : ''}`} role="menu">
                <Link href="/dashboard" className={navClassName('/dashboard')} onClick={closeOverlay}>Dashboard</Link>
                <Link href="/profile" className={navClassName('/profile')} onClick={closeOverlay}>Profile</Link>
                <Link href="/settings" className={navClassName('/settings')} onClick={closeOverlay}>Settings</Link>
                {user?.role === 'mod' || user?.role === 'admin' ? (
                  <Link href="/moderation" className={navClassName('/moderation')} onClick={closeOverlay}>Moderation</Link>
                ) : null}
                <button type="button" className="nav-cta nav-logout" onClick={onLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <Link href="/auth" className="nav-cta" onClick={closeOverlay}>Sign In</Link>
          )}
        </nav>

        <button type="button" className="menu-toggle" onClick={toggleOverlay} aria-label="Toggle menu">
          {isOverlayOpen ? <BsX size={24} /> : <BsList size={24} />}
        </button>
      </div>
    </header>
  );
};

export default NavBar;
