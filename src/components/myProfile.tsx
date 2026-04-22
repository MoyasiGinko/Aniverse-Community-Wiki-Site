// @ts-nocheck
"use client";

import Link from 'next/link';
import MyAnimes from './child/myAnimes';

const MyProfile = () => (
  <main className="page-shell">
    <section className="section-header">
      <h1>My Anime Space</h1>
      <p>Track your list, jump into community, and grow your badge streak.</p>
      <div className="inline-actions">
        <Link href="/stats" className="action-button">View Stats</Link>
        <Link href="/community" className="action-button ghost">Open Community</Link>
      </div>
    </section>
    <MyAnimes />
  </main>
);

export default MyProfile;
