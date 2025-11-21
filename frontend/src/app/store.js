import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../features/authSlice";
import balanceReducer from "../features/balanceSlice";
import tradeReducer from "../features/tradeSlice";
import targetReducer from '../features/targetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    balance: balanceReducer,
    trades: tradeReducer,
    target: targetReducer,
  },
});
