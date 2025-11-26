import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  profile: null,
  badges: [],
  leaderboard: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  recentUnlocks: [],
};

// Get user gamification profile
export const getGamificationProfile = createAsyncThunk(
  "gamification/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/gamification/profile`);
      console.log("Profile response:", res.data);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Get all badges
export const getAllBadges = createAsyncThunk(
  "gamification/getAllBadges",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/gamification/badges`);
      console.log("Badges response:", res.data);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Get leaderboard
export const getLeaderboard = createAsyncThunk(
  "gamification/getLeaderboard",
  async ({ type = "level", limit = 20 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_URL}/gamification/leaderboard?type=${type}&limit=${limit}`
      );
      console.log("Leaderboard response:", res.data);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    reset: (state) => initialState,
    clearError: (state) => {
      state.isError = false;
      state.message = "";
    },
    addRecentUnlock: (state, action) => {
      state.recentUnlocks.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearRecentUnlocks: (state) => {
      state.recentUnlocks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profile
      .addCase(getGamificationProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGamificationProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload.data;
      })
      .addCase(getGamificationProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get All Badges
      .addCase(getAllBadges.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllBadges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.badges = action.payload.data;
      })
      .addCase(getAllBadges.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Leaderboard
      .addCase(getLeaderboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leaderboard = action.payload.data;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearError, addRecentUnlock, clearRecentUnlocks } =
  gamificationSlice.actions;
export default gamificationSlice.reducer;