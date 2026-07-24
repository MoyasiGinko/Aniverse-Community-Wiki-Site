"use client";

import Link from "next/link";
import { BsGithub, BsTwitter, BsDiscord, BsYoutube } from "react-icons/bs";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <h3>Aniverse</h3>
          <p>Worldwide entertainment news, living wiki knowledge, and community collaboration.</p>
          <div className="footer-socials">
            <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord">
              <BsDiscord size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <BsTwitter size={18} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <BsGithub size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <BsYoutube size={18} />
            </a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Media Portals</h4>
          <Link href="/animes">Animes</Link>
          <Link href="/games">Games & Real Sports</Link>
          <Link href="/movies-series">Movies & Series</Link>
          <Link href="/musics">Musics & Billboard</Link>
          <Link href="/books">Manga & Books</Link>
        </div>

        <div className="footer-links-col">
          <h4>Ecosystem</h4>
          <Link href="/news">Global News Feed</Link>
          <Link href="/wiki">Wiki Database</Link>
          <Link href="/community">Community Forums</Link>
          <Link href="/dashboard">Member Dashboard</Link>
          <Link href="/settings">Security & Settings</Link>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Connected</h4>
          <p>Subscribe to receive weekly trending recaps and community updates across all media domains.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" required className="newsletter-input" />
            <button type="submit" className="newsletter-btn">Join</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-shell">
          <small>&copy; {year} Aniverse Community. All rights reserved.</small>
          <div className="footer-bottom-links">
            <Link href="/terms">Terms of Use</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
