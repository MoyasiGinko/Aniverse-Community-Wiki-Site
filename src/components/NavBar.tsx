// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BsList, BsX } from "react-icons/bs";
import {
  FiHome,
  FiCompass,
  FiGlobe,
  FiBookOpen,
  FiUsers,
  FiFilm,
  FiTv,
  FiMusic,
  FiBook,
  FiCpu,
  FiUser,
  FiSliders,
  FiShield,
  FiLogOut,
  FiChevronDown,
  FiLogIn,
} from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import logoImage from "../assets/av.png";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isExploreOpen, setExploreOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const accountRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOverlay = () => {
    setOverlayOpen(!isOverlayOpen);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setAccountOpen(false);
    setExploreOpen(false);
  };

  const onLogout = async () => {
    try {
      await logout();
      closeOverlay();
      router.push("/auth");
      router.refresh();
    } catch {
      closeOverlay();
    }
  };

  const navClassName = (path: string) =>
    `nav-link ${pathname === path ? "active" : ""}`;

  return (
    <header className="site-header">
      <div className="header-shell">
        <Link href="/" className="brand-mark" aria-label="Aniverse Home" onClick={closeOverlay}>
          <div className="brand-logo-frame">
            <Image
              src={logoImage}
              alt="Aniverse logo"
              className="logo-v"
              width={40}
              height={40}
              priority
            />
          </div>
          <div className="brand-title-group">
            <strong>Aniverse</strong>
            <span>Wiki & Community</span>
          </div>
        </Link>

        <nav className={`navBar ${isOverlayOpen ? "open" : ""}`}>
          <Link href="/" className={navClassName("/")} onClick={closeOverlay}>
            <FiHome className="nav-icon" /> Home
          </Link>

          {/* Explore Dropdown */}
          <div className="nav-dropdown" ref={exploreRef}>
            <button
              type="button"
              className="nav-dropdown-trigger"
              onClick={() => setExploreOpen((prev) => !prev)}
              aria-expanded={isExploreOpen}
            >
              <FiCompass className="nav-icon" /> Explore <FiChevronDown className={`dropdown-chevron ${isExploreOpen ? "open" : ""}`} />
            </button>
            <div className={`nav-dropdown-menu ${isExploreOpen ? "open" : ""}`}>
              <Link href="/animes" className={navClassName("/animes")} onClick={closeOverlay}>
                <FiFilm className="dropdown-icon" /> Animes
              </Link>
              <Link href="/games" className={navClassName("/games")} onClick={closeOverlay}>
                <FaGamepad className="dropdown-icon" /> Games
              </Link>
              <Link href="/movies-series" className={navClassName("/movies-series")} onClick={closeOverlay}>
                <FiTv className="dropdown-icon" /> Movies & Series
              </Link>
              <Link href="/musics" className={navClassName("/musics")} onClick={closeOverlay}>
                <FiMusic className="dropdown-icon" /> Musics
              </Link>
              <Link href="/books" className={navClassName("/books")} onClick={closeOverlay}>
                <FiBook className="dropdown-icon" /> Manga & Books
              </Link>
            </div>
          </div>

          <Link href="/news" className={navClassName("/news")} onClick={closeOverlay}>
            <FiGlobe className="nav-icon" /> News
          </Link>
          <Link href="/wiki" className={navClassName("/wiki")} onClick={closeOverlay}>
            <FiBookOpen className="nav-icon" /> Wiki
          </Link>
          <Link href="/community" className={navClassName("/community")} onClick={closeOverlay}>
            <FiUsers className="nav-icon" /> Community
          </Link>

          <ThemeToggle />

          {loading ? (
            <span className="nav-cta loading-pill" aria-busy="true">
              Syncing...
            </span>
          ) : isAuthenticated ? (
            <div className="account-menu" ref={accountRef}>
              <button
                type="button"
                className="account-trigger"
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
              >
                <div className="account-avatar-mini">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.username} />
                  ) : (
                    (user?.username?.[0] || "U").toUpperCase()
                  )}
                </div>
                <span className="account-username">@{user?.username}</span>
                <FiChevronDown className={`dropdown-chevron ${isAccountOpen ? "open" : ""}`} />
              </button>

              <div className={`account-dropdown ${isAccountOpen ? "open" : ""}`} role="menu">
                <div className="account-dropdown-header">
                  <strong>{user?.username}</strong>
                  <span>{user?.email}</span>
                </div>

                <div className="account-dropdown-divider" />

                <Link href="/dashboard" className="account-dropdown-item" onClick={closeOverlay}>
                  <FiCpu className="account-icon" /> Dashboard
                </Link>
                <Link href="/profile" className="account-dropdown-item" onClick={closeOverlay}>
                  <FiUser className="account-icon" /> Profile
                </Link>
                <Link href="/settings" className="account-dropdown-item" onClick={closeOverlay}>
                  <FiSliders className="account-icon" /> Settings
                </Link>

                {user?.role === "mod" || user?.role === "admin" ? (
                  <Link href="/moderation" className="account-dropdown-item mod-item" onClick={closeOverlay}>
                    <FiShield className="account-icon" /> Moderation Panel
                  </Link>
                ) : null}

                <div className="account-dropdown-divider" />

                <button type="button" className="account-dropdown-item logout-item" onClick={onLogout}>
                  <FiLogOut className="account-icon" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth" className="nav-cta" onClick={closeOverlay}>
              <FiLogIn style={{ marginRight: "6px" }} /> Sign In
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="menu-toggle"
          onClick={toggleOverlay}
          aria-label="Toggle menu"
        >
          {isOverlayOpen ? <BsX size={26} /> : <BsList size={26} />}
        </button>
      </div>
    </header>
  );
};

export default NavBar;
