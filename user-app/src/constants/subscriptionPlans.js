export const subscriptionPlans = {
  free: {
    name: "Free",
    maxEntries: 30,
    features: ["Export CSV", "Grafik dasar", "Penyimpanan lokal"],
    price: 0,
  },
  pro: {
    name: "Pro",
    maxEntries: Infinity,
    features: ["Unlimited entries", "Cloud sync", "Advanced analytics"],
    price: 29000,
  },
  lifetime: {
    name: "Lifetime",
    maxEntries: Infinity,
    features: ["Semua fitur", "Akses selamanya"],
    price: 399000,
  },
};

export const STORAGE_KEYS = {
  TRADING_JOURNAL: "trading_journal_v3",
  SUBSCRIPTION: "trading_journal_subscription_v3"
};

export const sampleData = [
  {
    id: "1",
    date: "2025-11-01",
    instrument: "XAUUSD",
    type: "Sell",
    lot: 0.05,
    entry: 1980.5,
    stop: 1990.0,
    take: 1965.0,
    exit: 1970.0,
    result: "Win",
    pips: 105,
    profit: 52500,
    balanceAfter: 552500,
    riskReward: 1.5,
    strategy: "Breakout + momentum",
    market: "Ranging -> breakout",
    eMotionBefore: "Calm",
    eMotionAfter: "Confident",
    screenshot: "",
    notes: "Good continuation after news",
  },
];