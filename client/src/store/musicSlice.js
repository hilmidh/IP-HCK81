import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getBaseUrl } from "../helpers/getBaseUrl";

// Async thunks
export const fetchSongs = createAsyncThunk("music/fetchSongs", async (_, thunkAPI) => {
  try {
    const url = new URL(getBaseUrl());
    url.pathname = "/gettoptracks";
    const { data } = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
      },
    });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchArtists = createAsyncThunk("music/fetchArtists", async (_, thunkAPI) => {
  try {
    const url = new URL(getBaseUrl());
    url.pathname = "/gettopartists";
    const { data } = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
      },
    });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchPlaylists = createAsyncThunk("music/fetchPlaylists", async (_, thunkAPI) => {
  try {
    const url = new URL(getBaseUrl());
    url.pathname = "/getplaylists";
    const { data } = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
      },
    });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

// Slice
const musicSlice = createSlice({
  name: "music",
  initialState: {
    songs: [],
    artists: [],
    playlists: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Songs
    builder.addCase(fetchSongs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSongs.fulfilled, (state, action) => {
      state.loading = false;
      state.songs = action.payload;
    });
    builder.addCase(fetchSongs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Artists
    builder.addCase(fetchArtists.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchArtists.fulfilled, (state, action) => {
      state.loading = false;
      state.artists = action.payload;
    });
    builder.addCase(fetchArtists.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Playlists
    builder.addCase(fetchPlaylists.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPlaylists.fulfilled, (state, action) => {
      state.loading = false;
      state.playlists = action.payload;
    });
    builder.addCase(fetchPlaylists.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default musicSlice.reducer;