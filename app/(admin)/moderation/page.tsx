"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest } from "@/src/lib/apiClient";
import { useProtectedAuth } from "@/src/hooks/useProtectedAuth";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";

type Report = {
  id: string;
  type: "thread" | "comment" | "wiki";
  targetId: string;
  reason: string;
  createdAt: string;
};

type WikiEntry = { id: string; title: string; status: string };

const MODERATION_ROLES: Array<"mod" | "admin"> = ["mod", "admin"];

export default function ModerationPage() {
  const {
    user,
    checking: authChecking,
    accessBlocked,
    forbidden,
    requestSignIn,
    handleUnauthorized,
  } = useProtectedAuth({ roles: MODERATION_ROLES });
  const [reports, setReports] = useState<Report[]>([]);
  const [wiki, setWiki] = useState<WikiEntry[]>([]);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const loadModerationData = useCallback(async () => {
    const reportsData = await apiRequest<{ reports: Report[] }>(
      "/api/moderation/reports",
      { suppressAuthPrompt: true },
    );
    const wikiData = await apiRequest<{ entries: WikiEntry[] }>("/api/wiki", {
      suppressAuthPrompt: true,
    });
    setReports(reportsData.reports);
    setWiki(wikiData.entries);
  }, []);

  const load = useCallback(async () => {
    if (authChecking) {
      return;
    }

    if (accessBlocked || forbidden || !user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setError("");

    try {
      await loadModerationData();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const syncedUser = await handleUnauthorized();
        if (syncedUser) {
          try {
            await loadModerationData();
            return;
          } catch (retryError) {
            if (retryError instanceof ApiError && retryError.status === 401) {
              await handleUnauthorized();
              return;
            }
            setError((retryError as Error).message);
            return;
          }
        }
        return;
      }
      setError((err as Error).message);
    } finally {
      setDataLoading(false);
    }
  }, [
    accessBlocked,
    authChecking,
    forbidden,
    handleUnauthorized,
    loadModerationData,
    user,
  ]);

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, [load]);

  const moderate = async (
    id: string,
    action: "publish" | "flag" | "archive",
  ) => {
    try {
      await apiRequest(`/api/wiki/${id}/moderate`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (authChecking || dataLoading) {
    return (
      <ProtectedPageSkeleton
        title="Verifying moderator access"
        detail="Checking your role and loading moderation data before rendering."
      />
    );
  }

  if (accessBlocked) {
    return (
      <main className="feature-page">
        <section className="section-block auth-lock-panel">
          <h1>Moderator sign in required</h1>
          <p>
            Sign in with a moderator or admin account to review reports and
            moderate wiki entries.
          </p>
          <div className="inline-actions">
            <button type="button" onClick={requestSignIn} className="nav-cta">
              Open Sign In
            </button>
            <Link href="/auth" className="action-button ghost">
              Go to auth page
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (forbidden && user) {
    return (
      <main className="feature-page">
        <section className="section-block auth-lock-panel">
          <h1>Moderator access denied</h1>
          <p>Your signed-in account does not have moderator permissions.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Moderation Dashboard</h1>
        <p>Review reports and moderate wiki visibility states.</p>
      </section>

      <section className="section-block list-panel">
        <h2>Reports</h2>
        <ul>
          {reports.map((report) => (
            <li key={report.id}>
              [{report.type}] {report.targetId} - {report.reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block list-panel">
        <h2>Wiki Moderation</h2>
        <ul>
          {wiki.map((entry) => (
            <li key={entry.id}>
              {entry.title} ({entry.status})
              <div className="inline-actions">
                <button
                  type="button"
                  onClick={() => moderate(entry.id, "publish")}
                >
                  Publish
                </button>
                <button
                  type="button"
                  onClick={() => moderate(entry.id, "flag")}
                >
                  Flag
                </button>
                <button
                  type="button"
                  onClick={() => moderate(entry.id, "archive")}
                >
                  Archive
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
