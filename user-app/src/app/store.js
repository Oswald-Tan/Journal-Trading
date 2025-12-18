import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../features/authSlice";
import balanceReducer from "../features/balanceSlice";
import tradeReducer from "../features/tradeSlice";
import targetReducer from '../features/targetSlice';
import subscriptionReducer from '../features/subscriptionSlice';
import gamificationReducer from '../features/gamificationSlice';
import calendarReducer from '../features/calendarSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    balance: balanceReducer,
    trades: tradeReducer,
    target: targetReducer,
    subscription: subscriptionReducer,
    gamification: gamificationReducer,
    calendar: calendarReducer
  },
});
