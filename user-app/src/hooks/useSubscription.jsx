import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSubscription } from '../features/subscriptionSlice';

export const useSubscription = (skipIfExists = true) => {
  const dispatch = useDispatch();
  const { subscription, isLoading, error } = useSelector((state) => state.subscription);

  useEffect(() => {
    // PERBAIKAN: Always fetch subscription data, but skip if already loading
    if (isLoading) return;
    
    // Jika skipIfExists true dan subscription sudah ada, jangan fetch ulang
    if (skipIfExists && subscription) {
      console.log("Skipping subscription fetch - data already exists:", subscription);
      return;
    }
    
    console.log("Fetching subscription data...");
    dispatch(getSubscription());
  }, [dispatch, subscription, skipIfExists, isLoading]);

  return { subscription, isLoading, error };
};