import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";
import { getBalance } from "./balanceSlice";

const initialState = {
  trades: [],
  trade: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Get all trades
export const getTrades = createAsyncThunk(
  "trades/getTrades",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/trades`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Create new trade
export const createTrade = createAsyncThunk(
  "trades/createTrade",
  async (tradeData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/trades`, tradeData);
      await thunkAPI.dispatch(getBalance());
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// PERBAIKAN BESAR: Update trade - Pastikan data ter-update
export const updateTrade = createAsyncThunk(
  "trades/updateTrade",
  async ({ tradeId, tradeData }, thunkAPI) => {
    try {
      console.log("Updating trade in Redux:", { tradeId, tradeData });
      const res = await axios.put(`${API_URL}/trades/${tradeId}`, tradeData);
      
      // PERBAIKAN: Refresh data yang diperlukan
      await thunkAPI.dispatch(getBalance());
      await thunkAPI.dispatch(getTrades()); // Refresh trades list
      
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Delete trade - DIPERBAIKI
export const deleteTrade = createAsyncThunk(
  "trades/deleteTrade",
  async (tradeId, thunkAPI) => {
    try {
      const res = await axios.delete(`${API_URL}/trades/${tradeId}`);
      await thunkAPI.dispatch(getBalance());
      await thunkAPI.dispatch(getTrades()); // Refresh trades list
      return { ...res.data, deletedTradeId: tradeId };
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const tradeSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    resetTrade: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    resetTradeState: (state) => initialState,
    // PERBAIKAN: Tambahkan reducer untuk update trade secara manual
    updateTradeInState: (state, action) => {
      const updatedTrade = action.payload;
      const index = state.trades.findIndex(
        (trade) => trade.id === updatedTrade.id
      );
      if (index !== -1) {
        state.trades[index] = updatedTrade;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Trades
      .addCase(getTrades.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trades = action.payload.data || [];
      })
      .addCase(getTrades.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Trade
      .addCase(createTrade.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTrade.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trades.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createTrade.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Trade
      .addCase(updateTrade.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTrade.fulfilled, (state, action) => {
        state.isLoading = false;

        // PERBAIKAN: Handle unchanged case
        if (action.payload.unchanged) {
          state.message = "No changes made";
          return;
        }

        state.isSuccess = true;
        
        // PERBAIKAN: Update trade dalam state
        const updatedTrade = action.payload.data;
        const index = state.trades.findIndex(
          (trade) => trade.id === updatedTrade.id
        );
        
        if (index !== -1) {
          state.trades[index] = updatedTrade;
        }
        
        state.message = action.payload.message;
      })
      .addCase(updateTrade.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Trade
      .addCase(deleteTrade.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTrade.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trades = state.trades.filter(
          (trade) => trade.id !== action.payload.deletedTradeId
        );
        state.message = action.payload.message;
      })
      .addCase(deleteTrade.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetTrade, resetTradeState, updateTradeInState } = tradeSlice.actions;
export default tradeSlice.reducer;