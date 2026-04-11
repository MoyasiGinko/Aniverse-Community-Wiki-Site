"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BsList, BsX } from 'react-icons/bs';
import logoImage from '../assets/av.png';
import ThemeToggle from './ThemeToggle';

const NavBar = () => {
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const pathname = usePathname();

  const toggleOverlay = () => {
    setOverlayOpen(!isOverlayOpen);
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
          <Link href="/" className={navClassName('/')}>Home</Link>
          <Link href="/anime" className={navClassName('/anime')}>Anime</Link>
          <Link href="/genres" className={navClassName('/genres')}>Genres</Link>
          <Link href="/search" className={navClassName('/search')}>Search</Link>
          <Link href="/wiki" className={navClassName('/wiki')}>Wiki</Link>
          <Link href="/community" className={navClassName('/community')}>Community</Link>
          <Link href="/stats" className={navClassName('/stats')}>Stats</Link>
          <Link href="/profile" className={navClassName('/profile')}>Profile</Link>
          <Link href="/moderation" className={navClassName('/moderation')}>Moderation</Link>
          <Link href="/auth" className="nav-cta">Sign In</Link>
          <ThemeToggle />
        </nav>

        <button type="button" className="menu-toggle" onClick={toggleOverlay} aria-label="Toggle menu">
          {isOverlayOpen ? <BsX size={24} /> : <BsList size={24} />}
        </button>
      </div>
    </header>
  );
};

export default NavBar;
