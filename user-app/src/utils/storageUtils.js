import { STORAGE_KEYS, sampleData } from "../constants/subscriptionPlans";

export const initializeStorage = () => {
  const getEntries = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRADING_JOURNAL);
      return raw ? JSON.parse(raw) : sampleData;
    } catch (e) {
      console.error(e);
      return sampleData;
    }
  };

  const getSubscription = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      return saved ? JSON.parse(saved) : { plan: "free", expiresAt: null };
    } catch {
      return { plan: "free", expiresAt: null };
    }
  };

  const saveEntries = (entries) => {
    localStorage.setItem(STORAGE_KEYS.TRADING_JOURNAL, JSON.stringify(entries));
  };

  const saveSubscription = (subscription) => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
  };

  return {
    getEntries,
    getSubscription,
    saveEntries,
    saveSubscription
  };
};