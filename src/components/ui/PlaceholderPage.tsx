export default function PlaceholderPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-white mb-4">Coming Soon</h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl">
        This domain is currently under construction pending the integration of official APIs.
        Stay tuned!
      </p>
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md inline-block text-left text-gray-300 shadow-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">Planned Integration Status</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Animes (Jikan API) - <b>Live</b></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Books (Google Books) - <b>Live</b></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Games (RAWG) - <i>Pending Key</i></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Movies/Series (TMDB) - <i>Pending Key</i></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Musics (Spotify) - <i>Pending Key</i></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> News (NewsAPI) - <i>Pending Key</i></li>
        </ul>
      </div>
    </div>
  );
}
