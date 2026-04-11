import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAnimes = createAsyncThunk(
  'animes/fetchAnimes',
  async (page) => {
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/top/anime?page=${page}`,
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      throw new Error('Failed to fetch animes');
    }
  },
);

export const reserveAnime = createAsyncThunk(
  'animes/reserveAnime',
  async ({ animeId, title, imageUrl }) => {
    try {
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId: String(animeId), title, imageUrl }),
      });
      return String(animeId);
    } catch (error) {
      throw new Error('Failed to reserve anime');
    }
  },
);

export const cancelReservation = createAsyncThunk(
  'animes/cancelReservation',
  async (animeId) => {
    try {
      await fetch(`/api/watchlist?animeId=${encodeURIComponent(String(animeId))}`, {
        method: 'DELETE',
      });
      return String(animeId);
    } catch (error) {
      throw new Error('Failed to cancel reservation');
    }
  },
);

export const fetchWatchlist = createAsyncThunk(
  'animes/fetchWatchlist',
  async () => {
    const response = await fetch('/api/watchlist');
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return (data.items || []).map((entry) => String(entry.animeId));
  },
);

export const fetchNextPage = createAsyncThunk(
  'animes/fetchNextPage',
  async (_, { getState }) => {
    const { currentPage } = getState().animes;
    return currentPage + 1;
  },
);

export const fetchPreviousPage = createAsyncThunk(
  'animes/fetchPreviousPage',
  async (_, { getState }) => {
    const { currentPage } = getState().animes;
    return currentPage - 1;
  },
);

export const fetchFirstPage = createAsyncThunk(
  'animes/fetchFirstPage',
  async () => 1,
);

const initialState = {
  animes: [],
  watchlistIds: [],
  currentPage: 1,
  status: 'idle',
  error: null,
};

const animesSlice = createSlice({
  name: 'animes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnimes.pending, (state) => {
        state.status = 'loading';
        state.error = null; // Reset the error when fetching starts
      })
      .addCase(fetchAnimes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.animes = action.payload;
      })
      .addCase(fetchAnimes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(reserveAnime.fulfilled, (state, action) => {
        const animeId = action.payload;
        if (!state.watchlistIds.includes(animeId)) {
          state.watchlistIds.push(animeId);
        }
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const animeId = action.payload;
        state.watchlistIds = state.watchlistIds.filter((id) => id !== animeId);
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.watchlistIds = action.payload;
      })
      .addCase(fetchNextPage.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      })
      .addCase(fetchPreviousPage.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      })
      .addCase(fetchFirstPage.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      });
  },
});

export default animesSlice.reducer;
