// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('aniverse_theme') || 'light';
    setTheme(saved);
    document.body.dataset.theme = saved;
  }, []);

  const onToggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('aniverse_theme', next);
    document.body.dataset.theme = next;
  };

  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label="Toggle theme">
      <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
      <small>mode</small>
    </button>
  );
};

export default ThemeToggle;
