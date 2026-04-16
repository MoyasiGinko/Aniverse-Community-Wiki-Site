"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";

type Thread = {
  id: string;
  slug: string;
  title: string;
  body: string;
  imageUrls: string[];
  createdAt: string;
  communityId: string | null;
  wikiReferenceId: string | null;
  stats?: {
    upvotes: number;
    downvotes: number;
    saves: number;
    shares: number;
    views: number;
    comments: number;
  };
};

type Community = {
  id: string;
  slug: string;
  name: string;
};

export default function CommunityThreadSlugPage() {
  const params = useParams<{ slug: string; threadSlug: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [trendingThreads, setTrendingThreads] = useState<Thread[]>([]);
  const [communityById, setCommunityById] = useState<Map<string, Community>>(
    new Map(),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, trendingData, communitiesData] = await Promise.all([
          apiRequest<{ thread: Thread; community: Community }>(
            `/api/community/threads/by-slug?communitySlug=${params.slug}&threadSlug=${params.threadSlug}`,
          ),
          apiRequest<{ threads: Thread[] }>(
            "/api/community/threads?mode=trending&limit=10",
          ),
          apiRequest<{ communities: Community[] }>("/api/communities"),
        ]);
        setThread(data.thread);
        setCommunity(data.community);
        setTrendingThreads(
          trendingData.threads.filter((item) => item.id !== data.thread.id),
        );
        setCommunityById(
          new Map(
            communitiesData.communities.map((entry) => [entry.id, entry]),
          ),
        );
      } catch (err) {
        setError((err as Error).message);
      }
    };

    loadData();
  }, [params.slug, params.threadSlug]);

  if (error) {
    return (
      <main className="feature-page wiki-fandom-page">
        <p className="error-text">{error}</p>
      </main>
    );
  }

  if (!thread) {
    return (
      <main className="feature-page wiki-fandom-page">
        <div className="wiki-skeleton" style={{ height: "260px" }}></div>
      </main>
    );
  }

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="community-hub-grid fade-in-up">
        <section
          className="wiki-meta-panel fade-in-up"
          style={{ padding: "1.25rem" }}
        >
          <h1>{thread.title}</h1>
          <p className="wiki-meta-subtitle" style={{ marginTop: "0.3rem" }}>
            {community ? (
              <>
                In{" "}
                <Link
                  href={`/community/${community.slug}`}
                  className="workspace-link"
                >
                  {community.name}
                </Link>
              </>
            ) : (
              "Community thread"
            )}
            {" • "}
            {(thread.createdAt || "").slice(0, 16).replace("T", " ")}
          </p>
          <p style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
            {thread.body}
          </p>

          {thread.imageUrls?.length ? (
            <div
              className="community-attachment-grid"
              style={{ marginTop: "1rem" }}
            >
              {thread.imageUrls.map((url) => (
                <a
                  key={`${thread.id}-${url}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={url}
                    alt="Thread attachment"
                    className="community-attachment-thumb"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="meta-line" style={{ marginTop: "1rem" }}>
              No image attachments.
            </p>
          )}
        </section>

        <aside className="section-block portal-card community-top-sidebar">
          <h2 style={{ marginBottom: "0.75rem" }}>Top Trending Threads</h2>
          {trendingThreads.length ? (
            <ul className="community-sidebar-list">
              {trendingThreads.map((item, index) => {
                const itemCommunity = item.communityId
                  ? communityById.get(item.communityId)
                  : null;
                const href = itemCommunity
                  ? `/community/${itemCommunity.slug}/${item.slug}`
                  : `/community/thread/${item.id}`;
                return (
                  <li key={item.id} className="community-sidebar-item">
                    <Link href={href} className="community-sidebar-link">
                      <div className="community-sidebar-title-row">
                        <strong>
                          #{index + 1} {item.title}
                        </strong>
                      </div>
                      <small className="community-sidebar-meta">
                        {itemCommunity ? itemCommunity.name : "Global"} •{" "}
                        {(item.stats?.upvotes || 0) -
                          (item.stats?.downvotes || 0)}{" "}
                        score • {item.stats?.comments || 0} comments
                      </small>
                      <p className="community-sidebar-description">
                        {item.body.length > 90
                          ? `${item.body.slice(0, 90)}...`
                          : item.body}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="meta-line">No trending threads yet.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
