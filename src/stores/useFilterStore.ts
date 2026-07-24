"use client";

import { create } from "zustand";

interface FilterState {
  searchQuery: string;
  selectedGenre: string;
  sortBy: "popular" | "latest" | "rating";
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSortBy: (sort: "popular" | "latest" | "rating") => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: "",
  selectedGenre: "All",
  sortBy: "popular" as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () => set(initialState),
}));
