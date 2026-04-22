// @ts-nocheck
"use client";

import Link from 'next/link';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <h3>Aniverse</h3>
          <p>Modern anime discovery, wiki knowledge, and community collaboration.</p>
        </div>

        <div className="footer-links">
          <Link href="/anime">Anime</Link>
          <Link href="/genres">Genres</Link>
          <Link href="/wiki">Wiki</Link>
          <Link href="/community">Community</Link>
          <Link href="/stats">Stats</Link>
          <Link href="/profile">Profile</Link>
        </div>

        <div className="footer-meta">
          <p>Built for anime enthusiasts</p>
          <small>{year} Aniverse. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
