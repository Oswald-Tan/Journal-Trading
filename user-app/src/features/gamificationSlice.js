import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  profile: null,
  badges: [],
  leaderboard: null,
  leaderboardHistory: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  recentUnlocks: [],
  isLoadingLeaderboard: false, // Ditambahkan
  isLoadingBadges: false, // Ditambahkan
};

// Get user gamification profile
export const getGamificationProfile = createAsyncThunk(
  "gamification/getProfile",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/gamification/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Profile response:", res.data);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.msg || error.response.data?.error;
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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/gamification/badges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Badges response:", res.data);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.msg || error.response.data?.error;
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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/gamification/leaderboard?type=${type}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Leaderboard response:", res.data);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.msg || error.response.data?.error;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Get leaderboard history
export const getLeaderboardHistory = createAsyncThunk(
  "gamification/getLeaderboardHistory",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/gamification/leaderboard/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.msg || error.response.data?.error;
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
    updateProfileData: (state, action) => {
      if (state.profile && state.profile.level) {
        state.profile.level = {
          ...state.profile.level,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profile
      .addCase(getGamificationProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getGamificationProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload.data || action.payload;
        state.message = "";
      })
      .addCase(getGamificationProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to load profile";
        state.profile = null;
      })
      
      // Get All Badges
      .addCase(getAllBadges.pending, (state) => {
        state.isLoadingBadges = true;
        state.isError = false;
      })
      .addCase(getAllBadges.fulfilled, (state, action) => {
        state.isLoadingBadges = false;
        state.isSuccess = true;
        state.badges = action.payload.data || action.payload || [];
        state.message = "";
      })
      .addCase(getAllBadges.rejected, (state, action) => {
        state.isLoadingBadges = false;
        state.isError = true;
        state.message = action.payload || "Failed to load badges";
        state.badges = [];
      })
      
      // Get Leaderboard
      .addCase(getLeaderboard.pending, (state) => {
        state.isLoadingLeaderboard = true;
        state.isError = false;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.isLoadingLeaderboard = false;
        state.isSuccess = true;
        state.leaderboard = action.payload.data || action.payload;
        state.message = "";
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.isLoadingLeaderboard = false;
        state.isError = true;
        state.message = action.payload || "Failed to load leaderboard";
        state.leaderboard = null;
      })

      // Get Leaderboard History
      .addCase(getLeaderboardHistory.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getLeaderboardHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leaderboardHistory = action.payload.data || action.payload;
        state.message = "";
      })
      .addCase(getLeaderboardHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to load leaderboard history";
        state.leaderboardHistory = null;
      });
  },
});

export const { 
  reset, 
  clearError, 
  addRecentUnlock, 
  clearRecentUnlocks,
  updateProfileData 
} = gamificationSlice.actions;
export default gamificationSlice.reducer;