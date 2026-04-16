"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";

type Thread = {
  id: string;
  title: string;
  body: string;
  imageUrls: string[];
  createdAt: string;
  communityId: string | null;
  wikiReferenceId: string | null;
};

type Community = {
  id: string;
  slug: string;
  name: string;
};

export default function CommunityThreadPage() {
  const params = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const threadData = await apiRequest<{ thread: Thread }>(
          `/api/community/threads/${params.threadId}`,
        );
        setThread(threadData.thread);

        if (threadData.thread.communityId) {
          const communitiesData = await apiRequest<{
            communities: Community[];
          }>("/api/communities");
          const targetCommunity = communitiesData.communities.find(
            (item) => item.id === threadData.thread.communityId,
          );
          if (targetCommunity) {
            setCommunity(targetCommunity);
          }
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    loadData();
  }, [params.threadId]);

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
    </main>
  );
}
