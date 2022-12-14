import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { fetchGiphy } from "./fetchGiphy";
import type { Image } from "./fetchGiphy";

export interface SearchState {
  data: Image[];
  status: "idle" | "loading" | "failed";
  limit: number;
  currentSearch: string;
  offset: number;
  totalRequests: number;
}

const initialState: SearchState = {
  data: [],
  status: "idle",
  limit: 9,
  offset: 9,
  currentSearch: "",
  totalRequests: 0,
};
export const searchGiphyReducer = createSlice({
  name: "search-giphy",
  initialState,
  reducers: {
    setOffset: (state) => {
      state.offset += 9;
    },
    setCurrentSearch: (state, action) => {
      state.currentSearch = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGiphy.pending, (state) => {
        state.status = "loading";
        state.totalRequests += 1;
      })
      .addCase(getGiphy.fulfilled, (state, action) => {
        state.status = "idle";

        if (!action.meta.arg) {
          state.data = [];
        } else if (state.currentSearch !== action.meta.arg) {
          state.data = [...(action.payload as [])];
        } else {
          state.data = [...state.data, ...(action.payload as [])];
        }

        state.currentSearch = action.meta.arg;
      })
      .addCase(getGiphy.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const getGiphy = createAsyncThunk<any, string>(
  "searchGiphy/fetchGiphy",
  async (q: string, { getState, dispatch }) => {
    const { setOffset } = searchGiphyReducer.actions;
    if (!q) {
      return [];
    }
    const { limit, offset } = (getState() as RootState)
      .searchGiphy as SearchState;
    dispatch(setOffset());
    const response = await fetchGiphy({ q, limit, offset });
    return (response as any).data as Image[];
  }
  // {getPendingMeta({ arg, requestId }, { getState, extra }){return ""}}
);

export const selectStatus = (state: RootState) => state.searchGiphy.status;
export const selectLimit = (state: RootState) => state.searchGiphy.limit;
export const selectSearchResult = (state: RootState) => state.searchGiphy.data;
export const selectCurrentSearch = (state: RootState) =>
  state.searchGiphy.currentSearch;
export default searchGiphyReducer.reducer;
