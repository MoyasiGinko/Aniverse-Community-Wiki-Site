"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '../../../src/lib/apiClient';

type Entry = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: string;
  revision: number;
};

export default function WikiEntryPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await apiRequest<{ entry: Entry }>(`/api/wiki/${params.id}`);
    setEntry(data.entry);
    setTitle(data.entry.title);
    setBody(data.entry.body);
    setStatus(data.entry.status);
  };

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, [params.id]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest(`/api/wiki/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, body, status }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Wiki Entry</h1>
        <p>Update content and status with revision control.</p>
      </section>
      {entry ? (
        <form className="feature-form" onSubmit={save}>
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label htmlFor="body">Body</label>
          <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={8} required />

          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="flagged">Flagged</option>
            <option value="archived">Archived</option>
          </select>

          <button type="submit">Save Revision</button>
        </form>
      ) : (
        <p>Loading entry...</p>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
