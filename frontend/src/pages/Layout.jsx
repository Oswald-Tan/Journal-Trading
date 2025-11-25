import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { getBalance } from "../features/balanceSlice";
import { getTarget, getTargetProgress } from "../features/targetSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

// Import components
import Header from "../components/Header";
import BalanceModal from "../components/modals/BalanceModal";
import TargetModal from "../components/modals/TargetModal";
import { useSubscription } from '../hooks/useSubscription';

// PERBAIKAN: Pindahkan subscriptionPlans ke luar komponen agar referensinya stabil
const subscriptionPlans = {
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

const Layout = ({ children, onShowLanding }) => {
  const STORAGE_KEY = "trading_journal_v3";
  const SUBSCRIPTION_KEY = "trading_journal_subscription_v3";

  // Sample data
  const sample = [
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

  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : sample;
    } catch (e) {
      console.error(e);
      return sample;
    }
  });

  const [subscription, setSubscription] = useState(() => {
    try {
      const saved = localStorage.getItem(SUBSCRIPTION_KEY);
      return saved ? JSON.parse(saved) : { plan: "free", expiresAt: null };
    } catch {
      return { plan: "free", expiresAt: null };
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const {
    target,
    targetProgress,
    isLoading: targetLoading,
  } = useSelector((state) => state.target);
  const {
    initialBalance,
    currentBalance,
    isLoading: balanceLoading,
  } = useSelector((state) => state.balance);
  const { trades = [], stats: tradeStats = {} } = useSelector(
    (state) => state.trades
  );

  // PERBAIKAN: Gunakan useSubscription hook
  const { subscription: reduxSubscription, isLoading: subscriptionLoading } = useSubscription(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // PERBAIKAN: State untuk tracking data loading
  const [dataLoaded, setDataLoaded] = useState(false);

  // Get active tab from route
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/trades")) return "trades";
    if (path.includes("/calculator")) return "calculator";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/performance")) return "performance";
    if (path.includes("/targets")) return "targets";
    if (path.includes("/upgrade")) return "upgrade";
    if (path.includes("/education")) return "education";
    return "dashboard";
  }, [location.pathname]);

  // PERBAIKAN: Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      if (user && !dataLoaded) {
        try {
          // Load data essential
          await Promise.all([
            dispatch(getBalance()).unwrap(),
            dispatch(getTarget()).unwrap(),
          ]);
          setDataLoaded(true);
        } catch (error) {
          console.error("Error loading data:", error);
          setDataLoaded(true);
        }
      }
    };

    loadData();
  }, [dispatch, user, dataLoaded]);

  // PERBAIKAN: Load target progress hanya jika target enabled
  useEffect(() => {
    if (target?.enabled && dataLoaded) {
      dispatch(getTargetProgress());
    }
  }, [dispatch, target?.enabled, dataLoaded]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  }, [subscription]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // PERBAIKAN: Gabungkan subscription dari Redux dan local state
  const actualSubscription = useMemo(() => {
    return reduxSubscription || subscription || { plan: 'free' };
  }, [reduxSubscription, subscription]);

  // PERBAIKAN: Current plan berdasarkan actual subscription - FIX DEPENDENCY
  const currentPlan = useMemo(() => {
    return subscriptionPlans[actualSubscription.plan] || subscriptionPlans.free;
  }, [actualSubscription.plan]); // PERBAIKAN: subscriptionPlans sudah di luar komponen, jadi referensinya stabil

  // Calculate comprehensive stats - DIPERBAIKI
  const stats = useMemo(() => {
    // Gunakan trade stats dari Redux jika available
    if (Object.keys(tradeStats).length > 0) {
      return {
        ...tradeStats,
        initialBalance: initialBalance || 0,
        currentBalance: currentBalance || 0,
        targetProgress: targetProgress || null,
      };
    }

    // Fallback ke perhitungan manual jika tradeStats tidak ada
    const totalTrades = trades.length;
    const wins = trades.filter((e) =>
      e.result?.toLowerCase().includes("win")
    ).length;
    const losses = trades.filter((e) =>
      e.result?.toLowerCase().includes("lose")
    ).length;
    const netProfit = trades.reduce((sum, e) => sum + (e.profit || 0), 0);
    const avgProfit = totalTrades ? Math.round(netProfit / totalTrades) : 0;
    const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0;

    const totalPips = trades.reduce((sum, e) => sum + (e.pips || 0), 0);
    const avgPips = totalTrades ? Math.round(totalPips / totalTrades) : 0;
    const currentBalanceValue = currentBalance || 0;
    const initialBalanceValue = initialBalance || 0;
    const roi =
      initialBalanceValue > 0
        ? (
            ((currentBalanceValue - initialBalanceValue) /
              initialBalanceValue) *
            100
          ).toFixed(2)
        : 0;

    const winTrades = trades.filter((t) => t.profit > 0);
    const lossTrades = trades.filter((t) => t.profit < 0);
    const largestWin =
      winTrades.length > 0 ? Math.max(...winTrades.map((t) => t.profit)) : 0;
    const largestLoss =
      lossTrades.length > 0 ? Math.min(...lossTrades.map((t) => t.profit)) : 0;

    const profitFactor =
      wins > 0 && losses > 0
        ? (wins * avgProfit) / Math.abs(losses * avgProfit)
        : wins > 0
        ? 999
        : 0;

    return {
      totalTrades,
      wins,
      losses,
      netProfit,
      avgProfit,
      winRate,
      currentBalance: currentBalanceValue,
      totalPips,
      avgPips,
      roi,
      largestWin,
      largestLoss,
      initialBalance: initialBalanceValue,
      profitFactor,
      targetProgress: targetProgress || null,
    };
  }, [trades, tradeStats, initialBalance, currentBalance, targetProgress]);

  const upgradePlan = (newPlan) => {
    const newSubscription = {
      plan: newPlan,
      expiresAt:
        newPlan === "lifetime" ? null : Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    setSubscription(newSubscription);
    navigate("/dashboard");
  };

  // PERBAIKAN: Function handlers yang benar
  const handleShowUpgradeModal = () => {
    console.log("Layout: Navigating to upgrade page");
    navigate("/upgrade");
  };

  const handleShowBalanceModal = () => {
    setShowBalanceModal(true);
  };

  const handleShowTargetModal = () => {
    setShowTargetModal(true);
  };

  // Props untuk children components - DIPERBAIKI
  const commonProps = {
    entries,
    setEntries,
    stats,
    initialBalance: initialBalance || 0,
    currentBalance: currentBalance || 0,
    target: target || { enabled: false },
    targetProgress,
    subscription: actualSubscription, // PERBAIKAN: Gunakan actualSubscription
    currentPlan,
    onShowBalanceModal: handleShowBalanceModal,
    onShowTargetModal: handleShowTargetModal,
    onShowUpgradeModal: handleShowUpgradeModal,
    upgradePlan,
  };

  // PERBAIKAN: Improved loading state dengan subscription loading
  if ((balanceLoading || targetLoading || subscriptionLoading) && !dataLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-700 font-semibold">
            Loading application data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Component */}
      <Header
        activeTab={activeTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        stats={stats}
        target={target || { enabled: false }}
        targetProgress={targetProgress}
        user={user}
        currentPlan={currentPlan}
        subscription={actualSubscription} // PERBAIKAN: Gunakan actualSubscription
        onShowLanding={onShowLanding}
        onShowBalanceModal={handleShowBalanceModal}
        onShowTargetModal={handleShowTargetModal}
        onShowUpgradeModal={handleShowUpgradeModal}
        onProfileSettings={() => navigate("/profile-settings")}
      />

      {/* Main Content Area */}
      <main className="max-w-11/12 mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <Motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, commonProps);
              }
              return child;
            })}
          </Motion.div>
        </AnimatePresence>
      </main>

      {/* Modal Components */}
      <AnimatePresence>
        {showBalanceModal && (
          <BalanceModal setShowBalanceModal={setShowBalanceModal} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTargetModal && (
          <TargetModal setShowTargetModal={setShowTargetModal} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;