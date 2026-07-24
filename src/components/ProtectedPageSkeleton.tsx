// @ts-nocheck
"use client";

export default function ProtectedPageSkeleton({
  title = "Verifying session",
  detail = "Checking your access before rendering this page.",
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <main className="feature-page relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Abstract Pure Effect Skeleton Hero Banner */}
      <section className="workspace-hero-banner relative z-10" style={{ minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="hero-banner-content">
          <div className="wiki-skeleton skeleton-sidebar-pill" style={{ width: "160px", height: "24px", marginBottom: "1rem" }} />
          <div className="wiki-skeleton skeleton-card-header" style={{ width: "60%", height: "36px", marginBottom: "0.75rem" }} />
          <div className="wiki-skeleton skeleton-text-lbl" style={{ width: "80%", height: "18px" }} />
        </div>
      </section>

      <section className="workspace-layout relative z-10">
        <aside className="workspace-sidebar skeleton-sidebar section-block">
          <div className="wiki-skeleton skeleton-sidebar-pill" />
          <div className="wiki-skeleton skeleton-sidebar-pill" />
          <div className="wiki-skeleton skeleton-sidebar-pill" />
          <div className="wiki-skeleton skeleton-sidebar-pill" />
          <div className="wiki-skeleton skeleton-sidebar-pill" />
          <div className="wiki-skeleton skeleton-sidebar-pill" />
        </aside>

        <div className="workspace-content">
          <div className="wiki-skeleton skeleton-card">
            <div className="wiki-skeleton skeleton-card-header" />
            
            {/* Stats Row */}
            <div className="skeleton-stats-grid">
              <div className="wiki-skeleton skeleton-stat-item">
                <div className="wiki-skeleton skeleton-stat-num" />
                <div className="wiki-skeleton skeleton-stat-lbl" />
              </div>
              <div className="wiki-skeleton skeleton-stat-item">
                <div className="wiki-skeleton skeleton-stat-num" />
                <div className="wiki-skeleton skeleton-stat-lbl" />
              </div>
              <div className="wiki-skeleton skeleton-stat-item">
                <div className="wiki-skeleton skeleton-stat-num" />
                <div className="wiki-skeleton skeleton-stat-lbl" />
              </div>
              <div className="wiki-skeleton skeleton-stat-item">
                <div className="wiki-skeleton skeleton-stat-num" />
                <div className="wiki-skeleton skeleton-stat-lbl" />
              </div>
            </div>

            {/* List Rows */}
            <div className="skeleton-list">
              <div className="wiki-skeleton skeleton-list-item">
                <div className="wiki-skeleton skeleton-avatar" />
                <div className="skeleton-text-row">
                  <div className="wiki-skeleton skeleton-text-title" />
                  <div className="wiki-skeleton skeleton-text-lbl" />
                </div>
              </div>
              <div className="wiki-skeleton skeleton-list-item">
                <div className="wiki-skeleton skeleton-avatar" />
                <div className="skeleton-text-row">
                  <div className="wiki-skeleton skeleton-text-title" />
                  <div className="wiki-skeleton skeleton-text-lbl" />
                </div>
              </div>
              <div className="wiki-skeleton skeleton-list-item">
                <div className="wiki-skeleton skeleton-avatar" />
                <div className="skeleton-text-row">
                  <div className="wiki-skeleton skeleton-text-title" />
                  <div className="wiki-skeleton skeleton-text-lbl" />
                </div>
              </div>
              <div className="wiki-skeleton skeleton-list-item">
                <div className="wiki-skeleton skeleton-avatar" />
                <div className="skeleton-text-row">
                  <div className="wiki-skeleton skeleton-text-title" />
                  <div className="wiki-skeleton skeleton-text-lbl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
