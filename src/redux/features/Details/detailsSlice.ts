// @ts-nocheck
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAnimeDetailsById = async (animeId) => {
  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime/${animeId}`,
    );
    const data = await response.json();
    console.log(animeId);
    return data;
  } catch (error) {
    console.log('Error fetching anime details:', error);
    throw error;
  }
};

const initialState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchDetails = createAsyncThunk(
  'details/fetchDetails',
  async (animeId) => {
    try {
      const response = await fetchAnimeDetailsById(animeId);
      return response.data;
    } catch (error) {
      console.log('Error fetching details:', error);
      throw error;
    }
  },
);

const detailsSlice = createSlice({
  name: 'details',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDetails.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDetails.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchDetails.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });
  },
});

export default detailsSlice.reducer;
