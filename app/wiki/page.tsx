"use client";

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../src/lib/apiClient';

type WikiEntry = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  status: string;
  revision: number;
};

export default function WikiPage() {
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await apiRequest<{ entries: WikiEntry[] }>('/api/wiki');
    setEntries(data.entries);
  };

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, []);

  const createEntry = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/api/wiki', {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
          status: 'draft',
        }),
      });
      setTitle('');
      setBody('');
      setTags('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Wiki</h1>
        <p>Draft, revise, and publish entries with clean editorial flow.</p>
      </section>
      <form className="feature-form" onSubmit={createEntry}>
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label htmlFor="body">Body</label>
        <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={6} required />

        <label htmlFor="tags">Tags (comma-separated)</label>
        <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />

        <button type="submit">Create Entry</button>
      </form>

      <section className="section-block list-panel">
        <h2>All Entries</h2>
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link href={`/wiki/${entry.id}`}>{entry.title}</Link> - {entry.status} (rev {entry.revision})
            </li>
          ))}
        </ul>
      </section>
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
