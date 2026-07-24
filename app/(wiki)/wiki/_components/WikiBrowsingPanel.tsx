"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiSearch,
  FiBookOpen,
  FiTag,
  FiCheckCircle,
  FiFilter,
  FiChevronDown,
  FiClock,
  FiX,
} from "react-icons/fi";
import "@/src/styles/auth.css";

type WikiEntry = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: string;
  malAnimeTitle?: string;
  coverImageUrl?: string;
  revision: number;
  updatedAt?: string;
};

const palette = ["#204b57", "#4a2f6d", "#6a3f1f", "#234f34", "#3d3d7a", "#6a2f52"];

function colorFromTitle(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/* Custom Glassmorphism Modal Selection Component */
function CustomModalSelect<T extends string>({
  title,
  options,
  value,
  onChange,
  icon,
}: {
  title: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.id === value) || options[0];

  return (
    <>
      <button
        type="button"
        className="settings-input"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          cursor: "pointer",
          userSelect: "none",
          width: "100%",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {icon}
          {selectedOption.label}
        </span>
        <FiChevronDown style={{ color: "var(--brand)" }} />
      </button>

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.68)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="settings-card fade-in-up"
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "22px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              padding: "1.5rem",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--border)",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  margin: 0,
                }}
              >
                {icon} Select {title}
              </h3>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setOpen(false)}
                style={{ padding: "0.4rem", borderRadius: "50%", minWidth: "32px" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1rem",
                    borderRadius: "14px",
                    border: opt.id === value ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                    background: opt.id === value ? "rgba(240, 106, 17, 0.12)" : "color-mix(in srgb, var(--surface) 92%, var(--surface-soft))",
                    color: opt.id === value ? "var(--brand)" : "var(--text)",
                    fontWeight: opt.id === value ? 800 : 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "0.95rem" }}>{opt.label}</span>
                  {opt.id === value ? <FiCheckCircle style={{ color: "var(--brand)", fontSize: "1.1rem" }} /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function WikiBrowsingPanel({ entries }: { entries: WikiEntry[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "title" | "revision">("updated");

  const filteredEntries = entries.filter((entry) => {
    const passesStatus = statusFilter === "all" || entry.status === statusFilter;
    const searchIn = `${entry.title} ${entry.body} ${(entry.tags || []).join(" ")}`.toLowerCase();
    const passesQuery = searchIn.includes(query.trim().toLowerCase());
    return passesStatus && passesQuery;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "revision") {
      return b.revision - a.revision;
    }
    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
  });

  const statusOptions = [
    { id: "all", label: "All Statuses" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Draft" },
    { id: "flagged", label: "Flagged" },
    { id: "archived", label: "Archived" },
  ];

  const sortOptions = [
    { id: "updated", label: "Latest Update" },
    { id: "title", label: "Alphabetical Title" },
    { id: "revision", label: "Highest Revision" },
  ];

  return (
    <div className="fade-in-up" style={{ display: "grid", gap: "1.5rem" }}>
      {/* Search & Modal Filter Controls */}
      <section className="settings-card">
        <div className="settings-header-block">
          <div className="settings-header-info">
            <h2>Article Index & Directory</h2>
            <p>Filter by article status, search keywords, or sort by revision freshness.</p>
          </div>
        </div>

        {/* Row 1: Search Input */}
        <div style={{ marginTop: "1rem", position: "relative", width: "100%" }}>
          <input
            className="settings-input"
            style={{ paddingLeft: "2.5rem", width: "100%" }}
            placeholder="Search article titles, lore, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>

        {/* Row 2: Custom Glass Modal Selectors */}
        <div className="settings-field-row" style={{ marginTop: "0.75rem", gridTemplateColumns: "1fr 1fr" }}>
          <div className="settings-field-group">
            <CustomModalSelect
              title="Article Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              icon={<FiFilter style={{ color: "var(--brand)" }} />}
            />
          </div>

          <div className="settings-field-group">
            <CustomModalSelect
              title="Sort Order"
              options={sortOptions}
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              icon={<FiClock style={{ color: "var(--brand)" }} />}
            />
          </div>
        </div>
      </section>

      {/* Article List Cards */}
      <section className="settings-card">
        <div className="settings-header-block">
          <div className="settings-header-info">
            <h2>Knowledge Base Articles ({sortedEntries.length})</h2>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
          {sortedEntries.length ? (
            sortedEntries.map((entry) => (
              <div key={entry.id} className="session-item-row" style={{ alignItems: "flex-start" }}>
                <div className="connection-item-left" style={{ flex: 1 }}>
                  <div
                    className="avatar-preview-img-wrapper"
                    style={{
                      background: colorFromTitle(entry.title),
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      flexShrink: 0,
                    }}
                  >
                    {entry.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.coverImageUrl} alt={entry.title} />
                    ) : (
                      entry.title.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/wiki/${entry.id}`}
                      style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", textDecoration: "none" }}
                    >
                      {entry.title}
                    </Link>
                    {entry.malAnimeTitle ? (
                      <p className="settings-input-helper" style={{ margin: "0.15rem 0" }}>
                        Reference: <strong>{entry.malAnimeTitle}</strong>
                      </p>
                    ) : null}
                    <p className="settings-input-helper" style={{ margin: "0.25rem 0" }}>
                      {entry.body.slice(0, 180)}...
                    </p>

                    <div className="badge-pill-list" style={{ marginTop: "0.5rem" }}>
                      {(entry.tags || []).slice(0, 5).map((tag) => (
                        <span key={tag} className="badge-pill-item">
                          <FiTag style={{ marginRight: "4px" }} /> #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <span className="auth-badge">
                    <FiCheckCircle style={{ marginRight: "4px", color: "#10b981" }} /> {entry.status}
                  </span>
                  <span className="settings-input-helper">rev {entry.revision}</span>
                  <Link href={`/wiki/${entry.id}`} className="action-button ghost small">
                    <FiBookOpen style={{ marginRight: "4px" }} /> Read
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="settings-input-helper">No wiki articles found matching your filters.</p>
          )}
        </div>
      </section>
    </div>
  );
}
