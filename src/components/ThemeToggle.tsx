"use client";

import { useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useUiStore } from "../stores/useUiStore";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useUiStore();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.theme = theme;
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <FiMoon style={{ fontSize: "1.1rem", color: "var(--brand)" }} />
      ) : (
        <FiSun style={{ fontSize: "1.1rem", color: "#f59e0b" }} />
      )}
    </button>
  );
};

export default ThemeToggle;
