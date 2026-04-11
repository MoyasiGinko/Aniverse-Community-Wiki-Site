import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getStoredAnimeData = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedAnimeData = localStorage.getItem('animeData');
  return storedAnimeData ? JSON.parse(storedAnimeData) : [];
};

export const fetchGenrePageData = createAsyncThunk(
  'genrespage/fetchGenrePageData',
  async () => {
    try {
      const storedAnimeData = getStoredAnimeData();

      if (storedAnimeData.length === 0) {
        const genreResponse = await fetch(
          'https://api.jikan.moe/v4/genres/anime',
        );
        const genreData = await genreResponse.json();

        const totalPages = 5; // Number of pages to fetch
        const animeData = [];
        /* eslint-disable  */
        for (let page = 1; page <= totalPages; page++) {
          const response = await fetch(
            `https://api.jikan.moe/v4/top/anime?page=${page}`
          );
          const data = await response.json();
          animeData.push(...data.data);
          await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5-second delay
        }
        /* eslint-enable */
        return { genreData: genreData.data, animeData };
      }
      return { genreData: [], animeData: storedAnimeData };
    } catch (error) {
      console.log('Error fetching genre and anime data:', error);
      throw error;
    }
  },
);

const genrepageSlice = createSlice({
  name: 'genrepage',
  initialState: {
    genreData: [],
    animeData: getStoredAnimeData(),
    isLoading: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGenrePageData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchGenrePageData.fulfilled, (state, action) => {
      state.genreData = action.payload.genreData;
      state.animeData = action.payload.animeData;
      state.isLoading = false;
    });
    builder.addCase(fetchGenrePageData.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default genrepageSlice.reducer;
