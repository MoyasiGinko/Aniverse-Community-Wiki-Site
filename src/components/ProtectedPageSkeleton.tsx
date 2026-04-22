// @ts-nocheck
"use client";

export default function ProtectedPageSkeleton({
  title = "Verifying session",
  detail = "Checking your access before rendering this page.",
}) {
  return (
    <main className="feature-page">
      <section className="section-header">
        <div className="wiki-skeleton protected-skeleton-title" />
        <div className="wiki-skeleton protected-skeleton-copy" />
      </section>

      <section className="section-block protected-skeleton-shell">
        <p className="meta-line">{title}</p>
        <p>{detail}</p>
        <div className="protected-skeleton-grid">
          <div className="wiki-skeleton protected-skeleton-nav" />
          <div className="protected-skeleton-stack">
            <div className="wiki-skeleton protected-skeleton-card" />
            <div className="wiki-skeleton protected-skeleton-card" />
            <div className="wiki-skeleton protected-skeleton-card short" />
          </div>
        </div>
      </section>
    </main>
  );
}
