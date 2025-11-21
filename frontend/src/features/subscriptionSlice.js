import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

const initialState = {
  subscription: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Async thunk untuk get subscription
export const getSubscription = createAsyncThunk(
  'subscription/getSubscription',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/subscription`);
      console.log('Get subscription response:', res.data);
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk untuk check subscription status
export const checkSubscriptionStatus = createAsyncThunk(
  'subscription/checkSubscriptionStatus',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/subscription/status`);
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk untuk update subscription
export const updateSubscription = createAsyncThunk(
  'subscription/updateSubscription',
  async (subscriptionData, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}/subscription/update`, subscriptionData);
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    updateSubscriptionLocal: (state, action) => {
      if (state.subscription) {
        state.subscription = { ...state.subscription, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Subscription
      .addCase(getSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data;
      })
      .addCase(getSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.subscription = null;
      })
      // Check Subscription Status
      .addCase(checkSubscriptionStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data;
      })
      .addCase(checkSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, updateSubscriptionLocal } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;