"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="route-status">
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button type="button" onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
