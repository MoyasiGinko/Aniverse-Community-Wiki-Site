"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '../../src/lib/apiClient';

type Report = {
  id: string;
  type: 'thread' | 'comment' | 'wiki';
  targetId: string;
  reason: string;
  createdAt: string;
};

type WikiEntry = { id: string; title: string; status: string };

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [wiki, setWiki] = useState<WikiEntry[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    const reportsData = await apiRequest<{ reports: Report[] }>('/api/moderation/reports');
    const wikiData = await apiRequest<{ entries: WikiEntry[] }>('/api/wiki');
    setReports(reportsData.reports);
    setWiki(wikiData.entries);
  };

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, []);

  const moderate = async (id: string, action: 'publish' | 'flag' | 'archive') => {
    try {
      await apiRequest(`/api/wiki/${id}/moderate`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

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
                <button type="button" onClick={() => moderate(entry.id, 'publish')}>Publish</button>
                <button type="button" onClick={() => moderate(entry.id, 'flag')}>Flag</button>
                <button type="button" onClick={() => moderate(entry.id, 'archive')}>Archive</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
