import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSubscription } from '../features/subscriptionSlice';

export const useSubscription = (skipIfExists = true) => {
  const dispatch = useDispatch();
  const { subscription, isLoading, error } = useSelector((state) => state.subscription);

  useEffect(() => {
    // Jika skipIfExists true dan subscription sudah ada, jangan fetch ulang
    if (skipIfExists && subscription) {
      return;
    }
    
    dispatch(getSubscription());
  }, [dispatch, subscription, skipIfExists]);

  return { subscription, isLoading, error };
};