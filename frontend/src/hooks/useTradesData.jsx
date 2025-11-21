// hooks/useTradesData.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTrades } from '../features/tradeSlice';

export const useTradesData = () => {
  const dispatch = useDispatch();
  const { trades, stats, isLoading } = useSelector((state) => state.trades);

  useEffect(() => {
    const fetchData = async () => {
      if (trades.length === 0 && !isLoading) {
        await dispatch(getTrades());
      }
    };
    
    fetchData();
  }, [dispatch, trades.length, isLoading]);

  return { trades, stats, isLoading };
};