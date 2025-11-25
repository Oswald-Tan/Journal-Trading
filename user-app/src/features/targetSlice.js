import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

const initialState = {
  target: {
    enabled: false,
    targetBalance: 0,
    targetDate: '',
    description: '',
    startDate: '',
    useDailyTarget: false,
    dailyTargetPercentage: 0,
    dailyTargetAmount: 0
  },
  targetProgress: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get target
export const getTarget = createAsyncThunk(
  'target/getTarget',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/target`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

// Update target
export const updateTarget = createAsyncThunk(
  'target/updateTarget',
  async (targetData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/target`, targetData);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

// Get target progress
export const getTargetProgress = createAsyncThunk(
  'target/getTargetProgress',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/target/progress`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const targetSlice = createSlice({
  name: 'target',
  initialState,
  reducers: {
    resetTarget: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearTarget: (state) => {
      state.target = initialState.target;
      state.targetProgress = null;
    },
    // PERBAIKAN: Tambahkan reset loading state
    resetLoading: (state) => {
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Target
      .addCase(getTarget.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTarget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.target = action.payload.data;
      })
      .addCase(getTarget.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Target
      .addCase(updateTarget.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTarget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.target = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updateTarget.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Target Progress
      .addCase(getTargetProgress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTargetProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.targetProgress = action.payload.data;
      })
      .addCase(getTargetProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetTarget, clearTarget, resetLoading } = targetSlice.actions;
export default targetSlice.reducer;