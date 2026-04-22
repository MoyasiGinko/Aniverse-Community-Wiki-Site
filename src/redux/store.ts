// @ts-nocheck
import { configureStore } from '@reduxjs/toolkit';
import animesReducer from './features/Animes/animesSlice';
import genreReducer from './features/Genres/genreSlice';
import genrepageReducer from './features/Genres/pageSlice';
import detailsReducer from './features/Details/detailsSlice';

const store = configureStore({
  reducer: {
    animes: animesReducer,
    genre: genreReducer,
    genrespage: genrepageReducer,
    details: detailsReducer,
  },
});

export default store;
